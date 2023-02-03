import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from .. import manager
from .manager import add_access_token_to_response, user_to_access_token, user_to_dict
from .model import Token

_log = logging.getLogger(__name__)
jwt_router = APIRouter(tags=["Security"])

# TODO: Use schema to allow auto-doc of endpoint
# from fastapi.security import OAuth2PasswordBearer
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class SecurityStoreResponse(BaseModel):
    id: str
    ui: str | None
    configuration: dict[str, Any] = {}


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


@jwt_router.post("/login")
def post_login(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = manager.security.login(form_data.username, {"password": form_data.password})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token for this user
    access_token, payload = user_to_access_token(user)

    # Send it back to the client in JSON (as they can't read the cookies)
    response = JSONResponse(content=jsonable_encoder(user_to_dict(user, access_token=access_token, payload=payload)))

    # And as cookie (for easier frontend communication)
    add_access_token_to_response(response, access_token)
    return response  # type: ignore


@jwt_router.post("/logout")
def logout():
    payload, cookies = manager.security.logout()
    # Create response and add security store payload
    response = JSONResponse(content=dict(msg="Bye Bye", **payload))

    # Always clear the access token cookie
    cookies.extend([{"key": manager.settings.jwt_access_cookie_name, "value": "", "expires": -1}])
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
    user = manager.security.current_user
    return user_to_dict(user, access_token=user.access_token) if user else '"not_yet_logged_in"'


@jwt_router.get("/api/security/stores")
def stores(request: Request) -> list[SecurityStoreResponse]:
    """Returns a list of activated security stores. Can be used to infer the details of the shown login menu."""
    return [
        SecurityStoreResponse(id=s.id, ui=s.ui, configuration=s.user_configuration(request) or {}) for s in manager.security.user_stores
    ]
