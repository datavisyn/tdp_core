import logging

from fastapi import FastAPI, HTTPException
from fastapi.exception_handlers import http_exception_handler
from starlette.types import Message

from ..server.utils import detail_from_exception


# Use basic ASGI middleware instead of BaseHTTPMiddleware as it is significantly faster: https://github.com/tiangolo/fastapi/issues/2696#issuecomment-768224643
# Raw middlewares are actually quite complex: https://github.com/encode/starlette/blob/048643adc21e75b668567fc6bcdd3650b89044ea/starlette/middleware/errors.py#L147
class ExceptionHandlerMiddleware:
    def __init__(self, app: FastAPI):
        self.app: FastAPI = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        response_started = False

        async def _send(message: Message) -> None:
            nonlocal response_started, send

            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, receive, _send)
        except Exception as e:
            logging.exception("An error occurred in FastAPI")
            response = await http_exception_handler(
                None,  # type: ignore
                e if isinstance(e, HTTPException) else HTTPException(status_code=500, detail=detail_from_exception(e)),
            )
            if not response_started:
                await response(scope, receive, send)

            raise e
