from typing import Any

from fastapi import FastAPI, Request

from ..model import LogoutReturnValue, User


class BaseStore:
    def __init__(self):
        return None

    @property
    def id(self):
        return type(self).__name__

    def init_app(self, app: FastAPI):
        return None

    def load_from_request(self, request: Request) -> User | None:
        return None

    def load_from_key(self, key: str) -> User | None:
        return None

    def login(self, username: str, extra_fields=None) -> User | None:
        if extra_fields is None:
            extra_fields = {}
        return None

    def logout(self, user: User) -> LogoutReturnValue | None:
        return None

    def user_configuration(self, request: Request) -> dict[str, Any] | None:
        """User configuration of the store which is accessible via API."""
        return None
