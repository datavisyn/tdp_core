import logging

from fastapi import FastAPI, HTTPException
from fastapi.exception_handlers import http_exception_handler

from ..server.utils import detail_from_exception
from .request_context_plugin import get_request


# Use basic ASGI middleware instead of BaseHTTPMiddleware as it is significantly faster: https://github.com/tiangolo/fastapi/issues/2696#issuecomment-768224643
class ExceptionHandlerMiddleware:
    def __init__(self, app: FastAPI):
        self.app = app

    async def __call__(self, scope, receive, send):
        try:
            await self.app(scope, receive, send)
        except Exception as e:
            logging.exception("An error occurred in FastAPI")
            return await http_exception_handler(
                get_request(),  # type: ignore
                e if isinstance(e, HTTPException) else HTTPException(status_code=500, detail=detail_from_exception(e)),
            )
