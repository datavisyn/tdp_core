import logging
from builtins import object
from typing import List

from fastapi import FastAPI

from .parser import EntryPointPlugin, get_extensions_from_plugins

_log = logging.getLogger(__name__)


class Extension(object):
    """
    the loaded plugin instance
    """

    def __init__(self, desc, impl):
        self.desc = desc
        self.impl = impl
        self._cache = None

    def __call__(self, *args, **kwargs):
        """
        access and call the factory method of this plugin
        """
        if getattr(self.desc, "singleton", False) and self._cache is not None:
            return self._cache

        m = getattr(self.impl, self.desc.factory)

        if hasattr(m, "__call__"):
            v = m(*args, **kwargs)
        else:
            v = m
        self._cache = v
        return v

    def factory(self, *args, **kwargs):
        return self(*args, **kwargs)


class AExtensionDesc(object):
    def __init__(self, desc):
        self.type = desc.get("type", "unknown")
        self.id = desc["id"]
        self.name = self.id
        self.factory = "create"
        self.file = "main"
        self.version = "1.0"
        self.description = ""
        # copy all values
        for key, value in desc.items():
            self.__dict__[key] = value


class ExtensionDesc(AExtensionDesc):
    """
    plugin description
    """

    def __init__(self, desc):
        super(ExtensionDesc, self).__init__(desc)
        self._impl = None

        # from js notation to python notation
        self.module = self.module.replace("/", ".")

    def load(self):
        if self._impl is None:
            import importlib

            m = importlib.import_module(self.module)
            self._impl = Extension(self, m)
        return self._impl


class Registry(object):
    def __init__(self):
        self.plugins: List[EntryPointPlugin] = []
        self._extensions: List[ExtensionDesc] = []

    def init_app(self, app: FastAPI, plugins: List[EntryPointPlugin]):
        self.plugins = plugins
        self._extensions = [ExtensionDesc(p) for p in get_extensions_from_plugins(plugins)]

    def __len__(self):
        return len(self._extensions)

    def __getitem__(self, item):
        return self._extensions[item]

    def __iter__(self):
        return iter(self._extensions)

    def list(self, plugin_type=None) -> List[ExtensionDesc] | "Registry":
        if plugin_type is None:
            return self
        if not hasattr(plugin_type, "__call__"):  # not a callable
            return [x for x in self if x.type == plugin_type]
        return [x for x in self if plugin_type(x)]
