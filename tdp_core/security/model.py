import sys
from typing import Any, Dict, List, Optional

from pydantic import BaseModel

from .constants import ANONYMOUS


class Token(BaseModel):
    access_token: str
    token_type: str


class LogoutReturnValue(BaseModel):
    data: Optional[Dict[Any, Any]] = {}
    cookies: Optional[List[Dict[Any, Any]]] = []


class User(BaseModel):
    id: str
    name: str
    roles: List[str] = []

    def get_id(self):
        return str(self.id)

    @property
    def is_anonymous(self):
        return self.name == ANONYMOUS

    def has_role(self, role):
        return role in self.roles

    def __eq__(self, other):
        """
        Checks the equality of two `UserMixin` objects using `get_id`.
        """
        if isinstance(other, User):
            return self.get_id() == other.get_id()
        return NotImplemented

    def __ne__(self, other):
        """
        Checks the inequality of two `UserMixin` objects using `get_id`.
        """
        equal = self.__eq__(other)
        if equal is NotImplemented:
            return NotImplemented
        return not equal

    if sys.version_info[0] != 2:  # pragma: no cover
        # Python 3 implicitly set __hash__ to None if we override __eq__
        # We set it back to its default implementation
        __hash__ = object.__hash__


ANONYMOUS_USER = User(id=ANONYMOUS, name=ANONYMOUS, roles=[])
