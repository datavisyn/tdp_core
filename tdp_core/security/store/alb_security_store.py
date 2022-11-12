import logging
from typing import Optional

import jwt

from ... import manager
from ..model import LogoutReturnValue, User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class ALBSecurityStore(BaseStore):
    def __init__(
        self, cookie_name: Optional[str], signout_url: Optional[str], token_user_attr: Optional[str], token_roles_attr: Optional[str]
    ):
        self.cookie_name = cookie_name
        self.signout_url = signout_url
        self.token_user_attr = token_user_attr
        self.token_roles_attr = token_roles_attr

    def load_from_request(self, req):
        if "X-Amzn-Oidc-Identity" in req.headers and "X-Amzn-Oidc-Accesstoken" in req.headers and "X-Amzn-Oidc-Data" in req.headers:
            try:
                roles = []
                # Get token data from header
                _log.debug(f"headers: {req.headers}")
                encoded = req.headers["X-Amzn-Oidc-Data"]
                _log.debug(f"X-Amzn-Oidc-Data: {encoded}")
                _log.debug(f"X-Amzn-Oidc-Accesstoken: {req.headers['X-Amzn-Oidc-Accesstoken']}")
                _log.debug(f"X-Amzn-Oidc-Identity: {req.headers['X-Amzn-Oidc-Identity']}")
                # Try to decode the oidc data jwt
                user_data = jwt.decode(encoded, options={"verify_signature": False})
                _log.debug(f"user data: {user_data}")
                # Create new user from given attributes
                user = user_data[self.token_user_attr]
                _log.debug("user: %s", user)
                if self.token_roles_attr:
                    roles = user_data[self.token_roles_attr]
                _log.debug("roletype: %s", type(roles))
                if not roles:
                    roles = []
                elif type(roles) != dict:
                    roles = [roles]
                _log.debug("roles: %s", roles)
                return User(id=user, roles=roles)
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
            manager.settings.tdp_core.security.store.alb_security_store.token_user_attr,
            manager.settings.tdp_core.security.store.alb_security_store.token_roles_attr,
        )

    return None
