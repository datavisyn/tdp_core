from abc import ABC, abstractmethod
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel


class RegHelper:
    def __init__(self, plugin):
        self._items = []
        self._plugin = plugin

    def __iter__(self):
        return iter(self._items)

    def append(self, type_: str, id_: str, module_: Any, desc: dict[str, Any] | None = None):
        desc = desc if desc else {}
        desc["type"] = type_
        desc["id"] = id_
        desc["module"] = module_
        desc["plugin"] = self._plugin
        self._items.append(desc)

    def append_router(self, id_: str, module_: Any, desc: dict[str, Any]):
        # TODO: Validate desc
        return self.append("fastapi_router", id_, module_, desc)


class AVisynPlugin(ABC):
    @abstractmethod
    def register(self, registry: RegHelper):
        pass

    def init_app(self, app: FastAPI):  # noqa: B027
        pass

    @property
    def setting_class(self) -> type[BaseModel] | None:
        return None
