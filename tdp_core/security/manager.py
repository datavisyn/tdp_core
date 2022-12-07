import logging
from base64 import b64decode
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Callable, Dict, List, Optional, Tuple

import jwt
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.security.utils import get_authorization_scheme_param

from .. import manager
from ..middleware.request_context_middleware import get_request
from .model import ANONYMOUS_USER, LogoutReturnValue, User
from .store.base_store import BaseStore

_log = logging.getLogger(__name__)


def user_to_access_token(user: User) -> Tuple[str, Dict]:
    # Define access token data
    payload = {}

    # Add additional claims loader data
    for claims_loader in manager.security._additional_jwt_claims_loader:
        try:
            payload.update(claims_loader(user) or {})
        except Exception:
            _log.exception("Error calling additional claims loader")

    # Add required fields last
    payload.update(
        {
            "sub": user.id,
            "roles": user.roles,
            "exp": (datetime.utcnow() + timedelta(seconds=manager.settings.jwt_expire_in_seconds)).timestamp(),
        }
    )

    # Encode the token
    return jwt.encode(payload, manager.settings.secret_key, algorithm=manager.settings.jwt_algorithm), payload


def access_token_to_payload(token: str) -> Dict:
    return jwt.decode(token, manager.settings.secret_key, algorithms=[manager.settings.jwt_algorithm])


def access_token_to_user(token: str) -> User:
    payload = access_token_to_payload(token)
    username: str = payload.get("sub")
    if username is None:
        return None
    return User(id=username, access_token=token, roles=payload.get("roles", []))


def user_to_dict(user: User, access_token: Optional[str] = None, payload: Optional[Dict] = None) -> Dict:
    if not payload and access_token:
        payload = access_token_to_payload(access_token)

    return {
        "name": user.name,
        "roles": user.roles,
        "payload": payload,
        "access_token": access_token,
        "token_type": "bearer" if access_token else None,
    }


def add_access_token_to_response(response: Response, access_token: str) -> Response:
    response.set_cookie(
        key=manager.settings.jwt_access_cookie_name,
        value=access_token,
        httponly=True,
        max_age=manager.settings.jwt_expire_in_seconds,
        secure=manager.settings.jwt_cookie_secure,
        samesite=manager.settings.jwt_cookie_samesite,
        path=manager.settings.jwt_access_cookie_path,
    )

    return response


class SecurityManager:
    def __init__(self, user_stores: List[BaseStore]):
        self.user_stores: List[BaseStore] = user_stores
        self._additional_jwt_claims_loader: List[Callable[[User], Dict]] = []

    def login(self, username, extra_fields=None) -> Optional[User]:
        return self._delegate_stores_until_not_none("login", username, extra_fields or {})

    def logout(self):
        u = self.current_user
        response_payload = {}
        response_cookies = []
        for store in self.user_stores:
            customizations = store.logout(u) or LogoutReturnValue()
            # data is an arbitrary Dict which is added to the response payload.
            response_payload.update(customizations.data)
            # cookies is a list of Dicts which are passed 1:1 to response.set_cookie.
            response_cookies.extend(customizations.cookies)
        return response_payload, response_cookies

    def _delegate_stores_until_not_none(self, store_method_name: str, *args):
        """Run a method on ordered stores (if exists) until one doesn't return None"""
        for store in self.user_stores:
            method = getattr(store, store_method_name, None)
            if callable(method):
                try:
                    value = method(*args)
                except Exception:
                    _log.exception(f"Error executing {store_method_name} in {store}")
                else:
                    if value:
                        return value

    @property
    def current_user(self) -> Optional[User]:
        try:
            req = get_request()
            # Fetch the existing user from the request if there is any
            try:
                user = req.state.user
                if user:
                    return user
            except (KeyError, AttributeError):
                pass
            # If there is no user, try to load it from the request and store it in the request
            user = req.state.user = self.load_from_request(get_request())
            return user
        except HTTPException:
            return None
        except Exception:
            _log.exception("Error loading user from request")
            return None

    def load_from_request(self, request: Request):
        # Load user from any of the stores
        user = self._load_from_key(request) or self._delegate_stores_until_not_none("load_from_request", request)
        if user:
            return user

        # Load JWT user from header
        if "headers" in manager.settings.jwt_token_location:
            scheme, token = get_authorization_scheme_param(request.headers.get(manager.settings.jwt_header_name))
            if token and scheme.lower() == manager.settings.jwt_header_type:
                user = access_token_to_user(token)
                if user:
                    return user

        # Load JWT user from cookie
        if "cookies" in manager.settings.jwt_token_location:
            token_from_cookie = request.cookies.get(manager.settings.jwt_access_cookie_name)
            if token_from_cookie:
                user = access_token_to_user(token_from_cookie)
                if user:
                    return user

        # Raise an exception is no user could be loaded
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    def _load_from_key(self, request: Request) -> Optional[User]:
        # try to login using the api_key url arg
        api_key = request.headers.get("apiKey")
        if not api_key:
            # then, try to login using Basic Auth
            api_key = request.headers.get("Authorization")
            if api_key:
                try:
                    api_key = b64decode(api_key.replace("Basic ", "", 1)).decode("utf-8")
                except Exception:
                    pass
        if api_key:
            return self._delegate_stores_until_not_none("load_from_key", api_key)

    def init_app(self, app: FastAPI):
        # next, init every store if any requires that
        for store in self.user_stores:
            # first check if the actual "init_app" method is implemented and then call it
            init_store_app = getattr(store, "init_app", None)
            if callable(init_store_app):
                init_store_app(app)

        from .jwt_router import jwt_router

        app.include_router(jwt_router)

        # Using an `after_request` callback, we refresh any token that is within a few minutes of expiring.
        @app.middleware("http")
        async def refresh_token_middleware(request: Request, call_next):
            response = await call_next(request)
            try:
                # Use the cached user from the request, to only refresh a token if the user was actually requested. This avoids calling load_from_request for every request.
                user = request.state.user
                if user and user.access_token:
                    exp_timestamp = access_token_to_payload(user.access_token)["exp"]
                    target_timestamp = datetime.timestamp(
                        datetime.now(timezone.utc) + timedelta(seconds=manager.settings.jwt_refresh_if_expiring_in_seconds)
                    )
                    if target_timestamp > exp_timestamp:
                        access_token, payload = user_to_access_token(user)
                        add_access_token_to_response(response, access_token)
            except (RuntimeError, KeyError, AttributeError):
                # Case where there is not a valid JWT. Just return the original respone
                pass
            finally:
                return response

    def jwt_claims_loader(self, callback: Callable[[User], Dict]):
        """
        Register additional jwt claims loaders. These will be called with the current user when a new token is issued.

        Usage:
        ```python
        @manager.security.jwt_claims_loader
        def my_jwt_cliasm_loader(user: User):
            return {'identity': user.name}
        ```
        """
        self._additional_jwt_claims_loader.append(callback)
        return callback


def create_security_manager():
    """
    :return: the security manager
    """
    _log.info("Creating security_manager")

    user_stores = list(filter(None, [p.load().factory() for p in manager.registry.list("user_stores")]))
    if len(user_stores) == 0 or manager.settings.tdp_core.alwaysAppendDummyStore:
        from .store import dummy_store

        user_stores.append(dummy_store.create())

    return SecurityManager(user_stores=user_stores)


def is_logged_in():
    return manager.security.current_user is not None


def current_username():
    u = manager.security.current_user
    return u.name if hasattr(u, "name") else ANONYMOUS_USER.name


def current_user():
    user = manager.security.current_user
    if not user:
        return ANONYMOUS_USER
    return user


def login_required(f=None, *, users=(), roles=()):
    """Usage: @login_required or @login_required(users=("admin") or @login_required(roles=("admin"))"""

    def login_required_inner(fn=None):
        @wraps(fn)
        def decorator(*args, **kwargs):
            u = manager.security.current_user
            # Allow access only if a user is available
            if not u:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No user in login_required request")
            if users and u.name not in users:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not in allowed_users in login_required request")
            if roles and set(u.roles).intersection(roles):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="User role not in allowed_roles in login_required request"
                )
            return fn(*args, **kwargs)

        return decorator

    if f is None:
        return login_required_inner
    else:
        assert callable(f)
        return login_required_inner(f)
