from typing import Any, Dict, List, Optional

from pydantic import BaseModel

ANONYMOUS = "anonymous"


class Token(BaseModel):
    access_token: str
    token_type: str


class LogoutReturnValue(BaseModel):
    data: Optional[Dict[Any, Any]] = {}
    cookies: Optional[List[Dict[Any, Any]]] = []


class User(BaseModel):
    id: str
    roles: List[str] = []
    access_token: Optional[str] = None

    @property
    def name(self):
        return self.id

    @property
    def is_anonymous(self):
        return self.name == ANONYMOUS

    def has_role(self, role):
        return role in self.roles


ANONYMOUS_USER = User(id=ANONYMOUS, roles=[])
