from typing import Optional

from starlette.requests import HTTPConnection, Request
from starlette_context import context
from starlette_context.plugins.base import Plugin


def get_request() -> Request | None:
    return context.get("request")


class RequestContextPlugin(Plugin):
    # The returned value will be inserted in the context with this key
    key = "request"

    async def process_request(self, request: Request | HTTPConnection) -> Optional[Request | HTTPConnection]:
        return request
