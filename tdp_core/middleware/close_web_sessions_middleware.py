from fastapi import FastAPI

from .request_context_plugin import get_request


# Use basic ASGI middleware instead of BaseHTTPMiddleware as it is significantly faster: https://github.com/tiangolo/fastapi/issues/2696#issuecomment-768224643
# Raw middlewares are actually quite complex: https://github.com/encode/starlette/blob/048643adc21e75b668567fc6bcdd3650b89044ea/starlette/middleware/errors.py#L147
class CloseWebSessionsMiddleware:
    def __init__(self, app: FastAPI):
        self.app: FastAPI = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        await self.app(scope, receive, send)

        r = get_request()
        if r:
            try:
                for db_session in r.state.db_sessions:
                    try:
                        db_session.close()
                    except Exception:
                        pass
            except (KeyError, AttributeError):
                pass
