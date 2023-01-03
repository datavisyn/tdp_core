import logging

import opentelemetry.metrics as metrics
import opentelemetry.trace as trace
from fastapi import FastAPI
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.sdk.metrics import MeterProvider  # type: ignore
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader  # type: ignore
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

_log = logging.getLogger(__name__)


def init_telemetry(app: FastAPI, app_name: str, endpoint: str) -> None:
    # The FastAPI instrumentation is adding a middleware which is instantiated more than once, causing warnings for existing instruments
    # See https://github.com/open-telemetry/opentelemetry-python-contrib/issues/1335
    class InstrumentWarningFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "An instrument with name http.server." not in record.getMessage()

    logging.getLogger("opentelemetry.sdk.metrics._internal").addFilter(InstrumentWarningFilter())

    # TODO: using service.name breaks loki (unexpected .), but it is used like this in the LoggingInstrumentor
    resource = Resource.create(attributes={"service_name": app_name, "service.name": app_name, "compose_service": app_name})

    # Create MeterProvider with exporters and set it as the global meter provider
    meter = MeterProvider(
        resource=resource,
        metric_readers=[PeriodicExportingMetricReader(OTLPMetricExporter(endpoint=endpoint), export_interval_millis=5000)],
    )
    metrics.set_meter_provider(meter)

    # Create TracerProvider and set it as the global tracer provider
    tracer = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer)
    # Add the exporter to the tracer
    tracer.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint)))

    # Trace instrumentors
    LoggingInstrumentor().instrument(set_logging_format=False, tracer_provider=tracer)
    SQLAlchemyInstrumentor().instrument(enable_commenter=True, commenter_options={}, tracer_provider=tracer)
    HTTPXClientInstrumentor().instrument(tracer_provider=tracer)
    # Metric instrumentors
    SystemMetricsInstrumentor().instrument(meter_provider=meter)
    # Metric and trace instrumentors
    RequestsInstrumentor().instrument(tracer_provider=tracer, meter_provider=meter)
    FastAPIInstrumentor.instrument_app(app, meter_provider=meter, tracer_provider=tracer)

    @app.on_event("shutdown")
    def shutdown_event():
        _log.info("Shutting down OpenTelemetry meter and tracer")
        tracer.shutdown()
        meter.shutdown()

    # Loki logging
    import logging_loki

    loki_handler = logging_loki.LokiHandler(
        url="http://localhost:3100/loki/api/v1/push",
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

    # Metrics middleware
    from ..middleware.fastapi_metrics_middleware import FastAPIMetricsMiddleware

    app.add_middleware(FastAPIMetricsMiddleware, app_name=app_name)
