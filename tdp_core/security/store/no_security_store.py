import logging

from ... import manager
from ..model import User
from .base_store import BaseStore

_log = logging.getLogger(__name__)


class NoSecurityStore(BaseStore):
    def __init__(self, user: str, roles: list[str]):
        self.user = user
        self.roles = roles

    def load_from_request(self, req):
        return User(id=self.user, roles=self.roles)


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except tdp_core keys).
    if manager.settings.tdp_core.security.store.no_security_store.enable:
        _log.info("Adding NoSecurityStore")
        return NoSecurityStore(
            manager.settings.tdp_core.security.store.no_security_store.user,
            manager.settings.tdp_core.security.store.no_security_store.roles,
        )

    return None
