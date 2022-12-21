from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Type

from fastapi import FastAPI
from pydantic import BaseModel


class RegHelper(object):
    def __init__(self, plugin):
        self._items = []
        self._plugin = plugin

    def __iter__(self):
        return iter(self._items)

    def append(self, type_: str, id_: str, module_: Any, desc: Dict[str, Any] = {}):
        desc = {} if not desc else desc
        desc["type"] = type_
        desc["id"] = id_
        desc["module"] = module_
        desc["plugin"] = self._plugin
        self._items.append(desc)

    def append_router(self, id_: str, module_: Any, desc: Dict[str, Any]):
        # TODO: Validate desc
        return self.append("fastapi_router", id_, module_, desc)


class AVisynPlugin(ABC):
    @abstractmethod
    def register(self, registry: RegHelper):
        pass

    def init_app(self, app: FastAPI):
        pass

    @property
    def setting_class(self) -> Optional[Type[BaseModel]]:
        return None
