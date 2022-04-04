from typing import Optional

from fastapi import FastAPI, Request

from ..model import LogoutReturnValue, User


class BaseStore(object):
    def __init__(self):
        pass

    def init_app(self, app: FastAPI):
        return None

    def load_from_request(self, request: Request) -> User:
        return None

    def login(self, username: str, extra_fields={}) -> User:
        return None

    def logout(self, user: User) -> Optional[LogoutReturnValue]:
        pass
