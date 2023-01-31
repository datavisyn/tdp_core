import logging

import opentelemetry.metrics as metrics
import opentelemetry.trace as trace
from fastapi import FastAPI, Response
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk.metrics import MeterProvider  # type: ignore
from opentelemetry.sdk.metrics.export import MetricReader, PeriodicExportingMetricReader  # type: ignore
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from prometheus_client import CONTENT_TYPE_LATEST, REGISTRY, generate_latest

from .. import manager

_log = logging.getLogger(__name__)


def init_telemetry(app: FastAPI, app_name: str) -> None:
    # The FastAPI instrumentation is adding a middleware which is instantiated more than once, causing warnings for existing instruments
    # See https://github.com/open-telemetry/opentelemetry-python-contrib/issues/1335
    class InstrumentWarningFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "An instrument with name http.server." not in record.getMessage()

    logging.getLogger("opentelemetry.sdk.metrics._internal").addFilter(InstrumentWarningFilter())

    # TODO: using service.name breaks loki (unexpected .), but it is used like this in the LoggingInstrumentor
    resource = Resource.create(attributes={"service_name": app_name, SERVICE_NAME: app_name, "compose_service": app_name})

    metrics_enabled = manager.settings.tdp_core.telemetry.metrics.enabled
    metrics_export_endpoint = manager.settings.tdp_core.telemetry.metrics.export_endpoint
    traces_enabled = manager.settings.tdp_core.telemetry.traces.enabled
    traces_export_endpoint = manager.settings.tdp_core.telemetry.traces.export_endpoint
    timeout = 1

    if metrics_enabled:
        _log.info("Enabling OpenTelemetry metrics")

        metric_readers: list[MetricReader] = [PrometheusMetricReader()]

        if metrics_export_endpoint:
            metric_readers.append(
                PeriodicExportingMetricReader(
                    exporter=OTLPMetricExporter(endpoint=metrics_export_endpoint, timeout=timeout),
                    export_interval_millis=5_000,
                    export_timeout_millis=timeout * 1_000,
                )
            )

        # Create MeterProvider with exporters and set it as the global meter provider
        meter = MeterProvider(
            resource=resource,
            metric_readers=metric_readers,
        )
        metrics.set_meter_provider(meter)

        # Metric instrumentors
        SystemMetricsInstrumentor().instrument(meter_provider=meter)

        @app.on_event("shutdown")
        def shutdown_meter_event():
            _log.info("Shutting down OpenTelemetry meter")
            try:
                meter.shutdown(timeout_millis=timeout * 1_000)
            except Exception:
                _log.exception("Error shutting down OpenTelemetry meter")

        class CustomMetricsResponse(Response):
            media_type = CONTENT_TYPE_LATEST

        @app.get("/metrics", tags=["Telemetry"], response_class=CustomMetricsResponse)
        def prometheus_metrics():
            """
            Prometheus metrics endpoint
            """
            return CustomMetricsResponse(generate_latest(REGISTRY), headers={"Content-Type": CONTENT_TYPE_LATEST})

    if traces_enabled:
        _log.info("Enabling OpenTelemetry traces")
        # Create TracerProvider and set it as the global tracer provider
        tracer = TracerProvider(resource=resource)
        trace.set_tracer_provider(tracer)

        if traces_export_endpoint:
            # Add the exporter to the tracer
            tracer.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=traces_export_endpoint, timeout=timeout)))

        # Trace instrumentors
        LoggingInstrumentor().instrument(set_logging_format=False, tracer_provider=tracer)
        SQLAlchemyInstrumentor().instrument(enable_commenter=True, commenter_options={}, tracer_provider=tracer)
        HTTPXClientInstrumentor().instrument(tracer_provider=tracer)

        @app.on_event("shutdown")
        def shutdown_tracer_event():
            _log.info("Shutting down OpenTelemetry tracer")
            try:
                tracer.shutdown()
            except Exception:
                _log.exception("Error shutting down OpenTelemetry tracer")

    if metrics_enabled and traces_enabled:
        assert tracer  # type: ignore
        assert meter  # type: ignore

        # Metric and trace instrumentors
        RequestsInstrumentor().instrument(tracer_provider=tracer, meter_provider=meter)
        FastAPIInstrumentor.instrument_app(app, meter_provider=meter, tracer_provider=tracer)

    logs_settings = manager.settings.tdp_core.telemetry.logs
    if logs_settings.enabled and logs_settings.export_endpoint:
        _log.info("Enabling Loki logging")
        import logging_loki

        loki_handler = logging_loki.LokiHandler(
            url=logs_settings.export_endpoint,
            auth=(logs_settings.username, logs_settings.password) if logs_settings.username and logs_settings.password else None,
            tags={"service_name": app_name, "compose_service": app_name},
            version="1",
        )
        loki_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] [trace_id=%(otelTraceID)s span_id=%(otelSpanID)s resource.service_name=%(otelServiceName)s] - %(message)s"
            )
        )
        # Add the loki handler to the root logger
        logging.getLogger().addHandler(loki_handler)
        logging.getLogger("uvicorn.access").addHandler(loki_handler)

    if manager.settings.tdp_core.telemetry.metrics_middleware.enabled:
        _log.info("Enabling FastAPIMetricsMiddleware")
        # Metrics middleware
        from ..middleware.fastapi_metrics_middleware import FastAPIMetricsMiddleware

        app.add_middleware(FastAPIMetricsMiddleware, app_name=app_name)
