from typing import Union
from fastapi import Request
from ..model import LogoutReturnValue, User


class BaseStore(object):
    def __init__(self):
        pass

    def init_app(self, app):
        return None

    def load_from_request(self, request: Request) -> User:
        return None

    def login(self, username, extra_fields={}) -> User:
        return None

    def logout(self, user) -> Union[LogoutReturnValue, None]:
        pass
