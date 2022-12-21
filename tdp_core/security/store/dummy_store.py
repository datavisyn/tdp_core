import hashlib
import logging

from ... import manager
from ..model import User
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


class DummyStore(BaseStore):
    def __init__(self):
        self._users = [
            DummyUser(
                id=v["name"],
                roles=v["roles"],
                password=v["password"],
                salt=v["salt"],
            )
            for v in manager.settings.tdp_core.users
        ]

    def load_from_key(self, api_key: str):
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
