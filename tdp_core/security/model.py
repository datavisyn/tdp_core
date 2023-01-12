from typing import Any

from pydantic import BaseModel

ANONYMOUS = "anonymous"


class Token(BaseModel):
    access_token: str
    token_type: str


class LogoutReturnValue(BaseModel):
    data: dict[Any, Any] | None = {}
    cookies: list[dict[Any, Any]] | None = []


class User(BaseModel):
    id: str
    roles: list[str] = []
    access_token: str | None = None

    @property
    def name(self):
        return self.id

    @property
    def is_anonymous(self):
        return self.name == ANONYMOUS

    def has_role(self, role):
        return role in self.roles


ANONYMOUS_USER = User(id=ANONYMOUS, roles=[])
