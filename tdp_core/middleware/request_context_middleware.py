from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request

REQUEST_CTX_KEY = "fastapi_request"

_request_ctx_var: ContextVar[str] = ContextVar(REQUEST_CTX_KEY, default=None)


def get_request() -> Request:
    return _request_ctx_var.get()


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        request_ctx_key = _request_ctx_var.set(request)
        response = await call_next(request)
        _request_ctx_var.reset(request_ctx_key)
        return response
