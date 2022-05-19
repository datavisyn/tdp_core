import logging

from fastapi import HTTPException
from fastapi.exception_handlers import http_exception_handler
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request

from ..server.utils import detail_from_exception


class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        try:
            return await call_next(request)
        except Exception as e:
            logging.exception("An error occurred in FastAPI")
            return await http_exception_handler(
                request,
                e if isinstance(e, HTTPException) else HTTPException(status_code=500, detail=detail_from_exception(e)),
            )
