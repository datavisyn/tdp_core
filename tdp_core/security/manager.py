from datetime import datetime
from typing import List, Union
from fastapi import FastAPI, Request
from .store.base_store import BaseStore
from ..server.request_context import get_request
from ..plugin import registry
from .model import ANONYMOUS_USER, LogoutReturnValue, Token, User
from ..settings import get_global_settings
import logging
import jwt
from .constants import ANONYMOUS, SECRET_KEY, ALGORITHM
from fastapi import APIRouter
from datetime import timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from .constants import ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.responses import HTMLResponse, JSONResponse
from functools import wraps

_log = logging.getLogger(__name__)


class SecurityManager:
    def __init__(self, user_stores: List[BaseStore]):
        self.user_stores: List[BaseStore] = user_stores

    def login_required(self, func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            if not self.is_logged_in:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
            return func(*args, **kwargs)

        return decorated_view

    def login(self, username, extra_fields=None) -> Union[User, None]:
        if extra_fields is None:
            extra_fields = {}

        for store in self.user_stores:
            user = store.login(username, extra_fields)
            if user:
                return user
        return None

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

    @property
    def is_logged_in(self) -> bool:
        try:
            return self.current_user is not None
        except Exception:
            return False

    @property
    def current_user(self) -> User:
        return self.load_from_request(get_request())

    def has_role(self, role):
        return self.current_user.has_role(role)

    def load_from_request(self, request: Request):
        # Login using the request
        for store in self.user_stores:
            # first check if the actual "load_from_request" method is implemented and then call it
            load_from_req = getattr(store, "load_from_request", None)
            if callable(load_from_req):
                try:
                    user = load_from_req(request)
                except Exception:
                    _log.exception(f"Error loading from request in {store}")
                else:
                    if user:
                        return user

        # Raise an exception is no user could be loaded
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    def init_app(self, app: FastAPI):
        # next, init every store if any requires that
        for store in self.user_stores:
            # first check if the actual "init_app" method is implemented and then call it
            init_store_app = getattr(store, "init_app", None)
            if callable(init_store_app):
                init_store_app(app)

        jwt_router = APIRouter(tags=["Security"])

        @jwt_router.get("/login", response_class=HTMLResponse)
        def get_login():
            return """
            <!DOCTYPE html>
            <html>
                <body>
                    <form name="login" action="/login" method="post" accept-charset="utf-8">
                        <div><label for="username" class="form-label">User name: </label><input type="text" name="username" placeholder="name" required="required"></div>
                        <div><label for="password" class="form-label">Password</label><input type="password" name="password" placeholder="password" required="required"></div>
                        <div><input type="reset" value="Reset"><input type="submit" value="Login"></div>
                    </form>
                </body>
            </html>
            """

        @jwt_router.post("/login", response_model=Token)
        def post_login(form_data: OAuth2PasswordRequestForm = Depends()):
            # TODO
            user = self.login(form_data.username, {"password": form_data.password})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            # Define access token data
            access_token_data = {
                "sub": user.id,
                "roles": user.roles,
                "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            }
            # Encode the token
            access_token = jwt.encode(access_token_data, SECRET_KEY, algorithm=ALGORITHM)

            # Send it back to the client in JSON
            response = JSONResponse(
                content={
                    "name": user.name,
                    "roles": user.roles,
                    "access_token": access_token,
                    "token_type": "bearer",
                }
            )

            # And as cookie
            # TODO: Set max-age and so on
            response.set_cookie("dv_jwt", access_token, httponly=True, samesite="strict")

            return response

        @jwt_router.post("/logout")
        def logout():
            payload, cookies = self.logout()

            # Create response and add security store payload
            response = JSONResponse(content=dict(msg="Bye Bye", **payload))

            # Handle cookie changes from the security stores
            for cookie in cookies:
                try:
                    response.set_cookie(**cookie)
                except Exception:
                    _log.exception(f"Error setting cookie {cookie} to logout response")
            return response

        @jwt_router.get("/loggedinas")
        @jwt_router.post("/loggedinas")
        def loggedinas(request: Request):
            user = self.current_user
            if user:
                return {"name": user.name, "roles": user.roles}
            return '"not_yet_logged_in"'

        app.include_router(jwt_router)


_manager: SecurityManager = None


def security_manager():
    """
    :return: the security manager
    """
    global _manager
    if _manager is None:
        _manager = registry.lookup_singleton("security_manager")
        if _manager is None:
            raise Exception("No security_manager found")
    return _manager


def is_logged_in():
    return security_manager().current_user is not None


def login_required(func):
    return security_manager().login_required(func)


def current_username():
    u = security_manager().current_user
    return u.name if hasattr(u, "name") else ANONYMOUS


def current_user():
    user = security_manager().current_user
    if not user:
        return ANONYMOUS_USER
    return user


def create():
    _log.info("Creating security_manager")

    user_stores = list(filter(None, [p.load().factory() for p in registry.list_plugins("user_stores")]))
    if len(user_stores) == 0 or get_global_settings().tdp_core.alwaysAppendDummyStore:
        from .store import dummy_store

        user_stores.append(dummy_store.create())
    from .store import jwt_store

    user_stores.append(jwt_store.create())

    return SecurityManager(user_stores=user_stores)
