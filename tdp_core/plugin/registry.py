from builtins import object
import logging
from functools import cmp_to_key
from typing import List
from .parser import EntryPointPlugin, get_extensions_from_plugins

__registry = None

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


class PreLoadedExtensionDesc(AExtensionDesc):
    def __init__(self, desc, impl):
        super(PreLoadedExtensionDesc, self).__init__(desc)
        self._wrapper = PreLoadedExtension(impl)

    def load(self):
        return self._wrapper


class PreLoadedExtension(object):
    def __init__(self, impl):
        self._impl = impl

    def __call__(self, *args, **kwargs):
        return self._impl

    def factory(self, *args, **kwargs):
        return self._impl


class Registry(object):
    def __init__(self, plugins: List[EntryPointPlugin]):
        self.plugins = plugins
        self._extensions = [ExtensionDesc(p) for p in get_extensions_from_plugins(plugins)]
        self._extensions.append(PreLoadedExtensionDesc(dict(type="manager", id="registry"), self))

        self._singletons = None

    @property
    def singletons(self):
        import collections

        # check initialization
        _log = logging.getLogger(__name__)
        if self._singletons is not None:
            return self._singletons

        def loader(e):
            return lambda: e.load().factory()

        # select singleton impl with lowest priority default 100
        mm = collections.defaultdict(lambda: [])
        for e in self._extensions:
            if e.type == "manager":
                mm[e.id].append(e)

        def compare(a, b):
            a_prio = getattr(a, "priority", 100)
            b_prio = getattr(b, "priority", 100)
            return a_prio - b_prio

        def select(v):
            v = sorted(v, key=cmp_to_key(compare))
            _log.info("creating singleton %s %s", v[0].id, getattr(v[0], "module", "server"))
            return loader(v[0])

        self._singletons = {k: select(v) for k, v in mm.items()}

        return self._singletons

    def __len__(self):
        return len(self._extensions)

    def __getitem__(self, item):
        return self._extensions[item]

    def __iter__(self):
        return iter(self._extensions)

    def list(self, plugin_type=None):
        if plugin_type is None:
            return self
        if not hasattr(plugin_type, "__call__"):  # not a callable
            return [x for x in self if x.type == plugin_type]
        return [x for x in self if plugin_type(x)]

    def lookup(self, singleton_id):
        if singleton_id in self.singletons:
            return self.singletons[singleton_id]()
        return None


def list_plugins(plugin_type=None):
    return get_registry().list(plugin_type)


def lookup_singleton(singleton_id):
    return get_registry().lookup(singleton_id)


def get_registry() -> Registry:
    global __registry
    if __registry is None:
        raise Exception("Registry is not yet initialized!")
    return __registry
