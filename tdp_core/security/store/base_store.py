from abc import ABC
from typing import Optional

from fastapi import FastAPI, Request

from ..model import LogoutReturnValue, User


class BaseStore(ABC):
    def __init__(self):
        pass

    def init_app(self, app: FastAPI):
        pass

    def load_from_request(self, request: Request) -> Optional[User]:
        return None

    def load_from_key(self, key: str) -> Optional[User]:
        return None

    def login(self, username: str, extra_fields={}) -> Optional[User]:
        return None

    def logout(self, user: User) -> Optional[LogoutReturnValue]:
        pass
