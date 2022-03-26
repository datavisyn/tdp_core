from abc import ABC, abstractmethod
from typing import Any, Dict, Type

from pydantic import BaseSettings


class RegHelper(object):
    def __init__(self, plugin):
        self._items = []
        self._plugin = plugin

    def __iter__(self):
        return iter(self._items)

    def append(self, type_: str, id_: str, module_: Any, desc: Dict[str, Any] = None):
        desc = {} if desc is None else desc
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

    @property
    def setting_class(self) -> Type[BaseSettings]:
        return None
