import logging

import jwt

from ... import manager
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class ALBSecurityStore(BaseStore):
    ui = "AutoLoginForm"

    def __init__(self, cookie_name: str | None, signout_url: str | None):
        self.cookie_name = cookie_name
        self.signout_url: str | None = signout_url

    def load_from_request(self, req):
        if "X-Amzn-Oidc-Identity" in req.headers and "X-Amzn-Oidc-Accesstoken" in req.headers and "X-Amzn-Oidc-Data" in req.headers:
            try:
                # Get token data from header
                encoded = req.headers["X-Amzn-Oidc-Data"]
                # Try to decode the oidc data jwt
                user = jwt.decode(encoded, options={"verify_signature": False})
                # Create new user from given attributes
                email = user["email"]
                return User(id=email, roles=[])
            except Exception:
                _log.exception("Error in load_from_request")
                return None
        return None

    def logout(self, user):
        # https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#authentication-logout
        cookies = []
        if self.cookie_name:
            cookies.append({"key": self.cookie_name, "value": "", "expires": -1})
        payload = {}
        # Redirect-URL to be triggered after logout. Makes sure to properly logout of the IdP provider.
        # See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request for details.
        if self.signout_url:
            payload["alb_security_store"] = {"redirect": self.signout_url}

        return LogoutReturnValue(data=payload, cookies=cookies)


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except tdp_core keys).
    if manager.settings.tdp_core.security.store.alb_security_store.enable:
        _log.info("Adding ALBSecurityStore")
        return ALBSecurityStore(
            manager.settings.tdp_core.security.store.alb_security_store.cookie_name,
            manager.settings.tdp_core.security.store.alb_security_store.signout_url,
        )

    return None
