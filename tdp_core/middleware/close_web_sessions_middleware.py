from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request


class CloseWebSessionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        response = await call_next(request)

        try:
            for db_session in request.state.db_sessions:
                try:
                    db_session.close()
                except Exception:
                    pass
        except (KeyError, AttributeError):
            pass

        return response
