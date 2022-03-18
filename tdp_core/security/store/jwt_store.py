from fastapi import Request
from fastapi.security.utils import get_authorization_scheme_param
import logging

from tdp_core.security.model import LogoutReturnValue
from .base_store import BaseStore
from ..model import User
from ..constants import SECRET_KEY, ALGORITHM
import jwt

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
        token_from_cookie = request.cookies.get("dv_jwt")
        if token_from_cookie:
            return get_user_from_token(token_from_cookie)

        return None

    def login(self, username, extra_fields={}):
        return None

    def logout(self, user):
        return LogoutReturnValue(cookies=[{"key": "dv_jwt", "value": "", "expires": -1}])


def create():
    _log.info("Creating JWT store")
    return JWTStore()
