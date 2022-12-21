import importlib
import logging
from functools import cached_property, lru_cache
from importlib.metadata import EntryPoint, entry_points
from typing import Dict, List, Tuple, Type

from pydantic import BaseModel

from .. import manager
from .model import AVisynPlugin, RegHelper

_log = logging.getLogger(__name__)


def is_disabled_plugin(p):
    import re

    if manager.settings.tdp_core.enabled_plugins:
        return p.id not in manager.settings.tdp_core.enabled_plugins

    # TODO: Check if case insensitive
    def check(disable):
        return isinstance(disable, str) and re.match(disable, p.id)

    return any(map(check, manager.settings.tdp_core.disable.plugins))


def is_disabled_extension(extension, extension_type, p):
    import re

    if is_disabled_plugin(p):
        return True

    def check_elem(k, v):
        vk = extension_type if k == "type" else extension[k]
        return re.match(v, vk)

    def check(disable):
        if isinstance(disable, str):
            return re.match(disable, extension["id"])
        return all(check_elem(k, v) for k, v in disable.items())

    return any(map(check, manager.settings.tdp_core.disable.extensions))


class EntryPointPlugin(object):
    def __init__(self, entry_point: EntryPoint):
        self.entry_point = entry_point
        self.id = entry_point.name
        self.name = self.id
        self.title = self.name
        self.description = ""
        self.version = entry_point.dist.version if entry_point.dist else "0.0.0"
        self.extensions = []

    @staticmethod
    def is_app():
        return False

    @cached_property
    def plugin(self) -> AVisynPlugin:
        visyn_plugin_clazz: Type[AVisynPlugin] = self.entry_point.load()

        if not issubclass(visyn_plugin_clazz, AVisynPlugin):
            raise Exception("Entrypoint plugin {self.id} does not load a proper class extending AVisynPlugin")

        return visyn_plugin_clazz()

    @lru_cache
    def get_module(self):
        return importlib.import_module(self.id)

    @property
    def resolved(self):
        return self.version


def _find_entry_point_plugins():
    return [EntryPointPlugin(entry_point) for entry_point in entry_points(group="visyn.plugin")]


def load_all_plugins() -> List[EntryPointPlugin]:
    # Load all plugins found via entry points
    plugins: List[EntryPointPlugin] = [p for p in _find_entry_point_plugins() if not is_disabled_plugin(p)]
    plugins.sort(key=lambda p: p.id)

    _log.info(f"Discovered {len(plugins)} plugins: {', '.join([d.id for d in plugins])}")

    return plugins


def get_extensions_from_plugins(plugins: List[EntryPointPlugin]) -> List:
    server_extensions = []
    for plugin in plugins:
        reg = RegHelper(plugin)
        plugin.plugin.register(reg)
        ext = [r for r in reg if not is_disabled_extension(r, "python", plugin)]
        logging.info(f"plugin {plugin.id} registered {len(ext)} extension(s)")
        plugin.extensions = ext
        server_extensions.extend(ext)

    return server_extensions


def get_config_from_plugins(plugins: List[EntryPointPlugin]) -> Tuple[List[Dict[str, Dict]], Dict[str, Type[BaseModel]]]:
    # from ..settings.utils import load_config_file

    # With all the plugins, load the corresponding configuration files and add them to the global config
    files: List[Dict[str, Dict]] = []
    models: Dict[str, Type[BaseModel]] = {}
    for plugin in plugins:
        plugin_settings_model = plugin.plugin.setting_class
        if plugin_settings_model:
            logging.info(f"Plugin {plugin.id} has a settings model")
            # Load the class of the config and wrap it in a tuple like (<clazz>, ...),
            # such that pydantic can use it as type-hint in the create_model class.
            # Otherwise, it would except <clazz> to be the default value...
            models[plugin.id] = (plugin_settings_model, ...)  # type: ignore

        # TODO: Currently we append an empty object as "default", but we should actually pass an instance of the settings model instead.
        files.append({f"{plugin.id}": {}})
        # else:
        # _log.warn(f'No "visyn_settings_model" found for {plugin.id}. No configuration will be loaded.')
        # Load actual config.json
        # f = plugin.config_file()
        # if f:
        #     logging.info(f'Plugin {plugin.id} has a config.json')
        #     files.append({f"{plugin.id}": load_config_file(f)})

    return (files, models)
