import contextlib
import time

import opentelemetry.metrics as metrics
import opentelemetry.trace as trace
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Match
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from starlette.types import ASGIApp

from .. import manager

meter = metrics.get_meter(__name__)

apps_counter = meter.create_counter(name="fastapi_app_info", description="FastAPI application information", unit="1")

requests_counter = meter.create_counter(name="fastapi_requests_total", description="Total count of requests by method and path", unit="1")
responses_counter = meter.create_counter(
    name="fastapi_responses_total", description="Total count of responses by method, path and status codes", unit="1"
)
requests_processing_time_histogram = meter.create_histogram(
    name="fastapi_requests_duration_seconds", description="Histogram of requests processing time by path (in seconds)", unit="1"
)
requests_in_progress_counter = meter.create_up_down_counter(
    name="fastapi_requests_in_progress", description="Gauge of requests by method and path currently being processed", unit="1"
)
users_counter = meter.create_counter(name="fastapi_users_total", description="Total count of unique users", unit="1")
exceptions_counter = meter.create_counter(
    name="fastapi_exceptions_total", description="Total count of exceptions raised by path and exception type", unit="1"
)
requests_in_progress = meter.create_observable_gauge(name="requests", description="number of requests", unit="1")


# TODO: This middleware is quite slow, it should be replaced with one similar to the ASGI instrumentor middleware
class FastAPIMetricsMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp, app_name: str) -> None:
        super().__init__(app)
        self.app_name = app_name
        apps_counter.add(1, {"app_name": app_name})

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        method = request.method
        path, is_handled_path = self.get_path(request)

        if not is_handled_path:
            return await call_next(request)

        requests_in_progress_counter.add(1, {"method": method, "path": path, "app_name": self.app_name})
        requests_counter.add(1, {"method": method, "path": path, "app_name": self.app_name})
        before_time = time.perf_counter()
        try:
            response = await call_next(request)

            with contextlib.suppress(BaseException):
                user = manager.security.load_from_request(request)
                if user:
                    users_counter.add(1, {"user_id": user.id})
        except BaseException as e:
            status_code = HTTP_500_INTERNAL_SERVER_ERROR
            exceptions_counter.add(1, {"method": method, "path": path, "exception_type": type(e).__name__, "app_name": self.app_name})
            raise e from None
        else:
            status_code = response.status_code
            after_time = time.perf_counter()
            # retrieve trace id for exemplar
            span = trace.get_current_span()
            trace_id = trace.format_trace_id(span.get_span_context().trace_id)

            requests_processing_time_histogram.record(
                after_time - before_time, {"method": method, "path": path, "app_name": self.app_name, "traceID": trace_id}
            )
        finally:
            responses_counter.add(1, {"method": method, "path": path, "status_code": status_code, "app_name": self.app_name})  # type: ignore
            requests_in_progress_counter.add(-1, {"method": method, "path": path, "app_name": self.app_name})

        return response

    @staticmethod
    def get_path(request: Request) -> tuple[str, bool]:
        for route in request.app.routes:
            match, child_scope = route.matches(request.scope)
            if match == Match.FULL:
                return route.path, True

        return request.url.path, False
