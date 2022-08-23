from functools import lru_cache
import logging
from typing import Optional
from fastapi import Request

from ... import manager
from .base_store import BaseStore
from ..model import User
import requests

_log = logging.getLogger(__name__)


@lru_cache
def get_user_from_token(url: str, token: str) -> Optional[User]:
    res = requests.get(f"{url}/userinfo", headers={
        "Authorization": token
    })
    res.raise_for_status()
    payload = res.json()
    _log.info(payload)
    return User(id=payload["name"])


class Auth0SecurityStore(BaseStore):
    def __init__(self, url: str):
        self.url = url

    def load_from_request(self, req: Request):
        if req.headers.get('Authorization'):
            return get_user_from_token(self.url, req.headers.get('Authorization'))
        return None


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except tdp_core keys).
    if manager.settings.tdp_core.security.store.auth0_store.enable:
        _log.info(f"Adding Auth0Store of {manager.settings.tdp_core.security.store.auth0_store.url}")
        return Auth0SecurityStore(
            manager.settings.tdp_core.security.store.auth0_store.url,
        )

    return None
