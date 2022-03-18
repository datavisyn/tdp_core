from fastapi import Request
from ..model import User
import hashlib
import logging
from ...settings import get_global_settings
from .base_store import BaseStore

_log = logging.getLogger(__name__)


def hash_password(password, salt):
    return hashlib.sha512((password + salt).encode("utf-8")).hexdigest()


class DummyUser(User):
    password: str
    salt: str

    def is_password(self, given):
        given_h = hash_password(given, self.salt)
        return given_h == self.password


def from_env_var(k, v):
    elems = v.split(";")
    name = k[12:]  # PHOVEA_USER_
    salt = elems[0]
    password = elems[1]
    roles = elems[2:]
    return DummyUser(id=name, name=name, roles=roles, password=password, salt=salt)


class DummyStore(BaseStore):
    def __init__(self):
        import os

        # define users via env variables
        env_users = [from_env_var(k, v) for k, v in os.environ.items() if k.startswith("PHOVEA_USER_")]
        if env_users:
            self._users = env_users
        else:
            self._users = [
                DummyUser(
                    id=v["name"],
                    name=v["name"],
                    roles=v["roles"],
                    password=v["password"],
                    salt=v["salt"],
                )
                for v in get_global_settings().tdp_core.users
            ]

    def load_from_request(self, request: Request):
        api_key = request.headers.get("Authorization")
        if api_key:
            api_key = api_key.replace("Basic ", "", 1)
            try:
                import base64

                api_key = base64.b64decode(api_key)
            except Exception:
                pass
            parts = api_key.split(":")
            if len(parts) != 2:
                return None
            return next(
                (u for u in self._users if u.id == parts[0] and u.is_password(parts[1])),
                None,
            )

    def login(self, username, extra_fields={}):
        return next(
            (u for u in self._users if u.id == username and u.is_password(extra_fields["password"])),
            None,
        )

    def logout(self, user):
        pass


def create():
    _log.info("Creating dummy store")
    return DummyStore()
