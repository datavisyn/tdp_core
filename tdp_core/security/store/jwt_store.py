import logging

import jwt
from fastapi import Request
from fastapi.security.utils import get_authorization_scheme_param

from tdp_core.security.model import LogoutReturnValue

from ..constants import ALGORITHM, SECRET_KEY
from ..model import User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


# TODO: Use schema to allow auto-doc of endpoint
# from fastapi.security import OAuth2PasswordBearer
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_user_from_token(token: str) -> User:
    # TODO: Verify signature should be enabled
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": False})
    username: str = payload.get("sub")
    if username is None:
        return None
    return User(id=username, name=username, roles=payload.get("roles", []))


class JWTStore(BaseStore):
    def __init__(self):
        pass

    def load_from_request(self, request: Request):
        # Load from Authorization header
        scheme, token = get_authorization_scheme_param(request.headers.get("Authorization"))
        if token and scheme.lower() == "bearer":
            user = get_user_from_token(token)
            if user:
                return user

        # Load from cookie
        token_from_cookie = request.cookies.get("dv_access_token")
        if token_from_cookie:
            return get_user_from_token(token_from_cookie)

        return None

    def login(self, username, extra_fields={}):
        return None

    def logout(self, user):
        return LogoutReturnValue(cookies=[{"key": "dv_access_token", "value": "", "expires": -1}])


def create():
    _log.info("Creating JWT store")
    return JWTStore()
