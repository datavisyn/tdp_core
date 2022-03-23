from abc import ABC
from functools import lru_cache
from typing import Dict, List, Tuple, Type
from pkg_resources import iter_entry_points
import importlib
from pydantic import BaseSettings
from .reg_helper import RegHelper
from ..settings import get_global_settings
import logging
from os import path
import json
import sys

_log = logging.getLogger(__name__)


def is_disabled_plugin(p):
    import re

    def check(disable):
        return isinstance(disable, str) and re.match(disable, p.id)

    return any(map(check, get_global_settings().tdp_core.disable.plugins))


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

    return any(map(check, get_global_settings().tdp_core.disable.extensions))


def _git_head(cwd):
    import subprocess

    try:
        output = subprocess.check_output(["git", "rev-parse", "--verify", "HEAD"], cwd=cwd)
        return output.strip()
    except subprocess.CalledProcessError:
        return "error"


def _resolve_plugin(plugin):
    if path.isdir(path.join(plugin.folder, ".git")) and plugin.repository:
        repo = plugin.repository
        if repo.endswith(".git"):
            repo = repo[0:-4]
        return str(repo) + "/commit/" + str(_git_head(plugin.folder))
    # not a git repo
    return plugin.version


class APlugin(ABC):
    def register(self, reg: RegHelper):
        m = self.get_module()

        if hasattr(m, "phovea"):
            m.phovea(reg)
        else:
            _log.info(f'Plugin {self.id}@{m} has no function "phovea"')


class EntryPointPlugin(APlugin):
    def __init__(self, entry_point):
        self.id = entry_point.name
        self.name = self.id
        self.title = self.name
        self.description = ''
        self.version = entry_point.dist.version
        self.extensions = []
        self.repository = None
        self._loader = entry_point.load

        # Fetch the folder from the module directory
        self.folder = path.dirname(importlib.util.find_spec(entry_point.name).origin)

        # guess folder
        if path.exists(path.join(self.folder, 'buildInfo.json')):
            with open(path.join(self.folder, 'buildInfo.json')) as f:
                pkg = json.load(f)
            desc = pkg.get('description', '').split('\n')
            self.title = desc.pop(0) if len(desc) > 1 else self.name
            self.description = '\n'.join(desc)
            self.homepage = pkg.get('homepage')
            self.version = pkg['version']
            self.repository = pkg.get('repository', '')

    @staticmethod
    def is_app():
        return False

    def config_file(self):
        return None

    @lru_cache
    def get_module(self):
        return importlib.import_module(self.id)

    @property
    def resolved(self):
        return self.version


class DirectoryPlugin(APlugin):
    def __init__(self, package_file):
        folder = path.dirname(package_file)
        with open(package_file) as f:
            pkg = json.load(f)
        self.id = pkg["name"]
        self._clean_id = self.id.lower().replace("-", "_")
        self.pkg = pkg
        self.name = self.id
        desc = pkg.get("description", "").split("\n")
        self.title = desc.pop(0) if len(desc) > 1 else self.name
        self.description = "\n".join(desc)
        self.homepage = pkg.get("homepage")
        self.version = pkg["version"]
        self.extensions = []
        self.repository = pkg.get("repository", {}).get("url")
        self.folder = folder

    def is_app(self):
        f = path.join(self.folder, "build", "index.html")
        return path.exists(f)

    def config_file(self) -> str | None:
        for f in [
            path.join(self.folder, "config.json"),
            path.join(self.folder, self.id, "config.json"),
            path.join(self.folder, self._clean_id, "config.json"),
        ]:
            if path.exists(f):
                return f
        return None

    @lru_cache
    def get_module(self):
        f = path.join(self.folder, self.id, "__init__.py")
        if not path.exists(f):
            return False
        # append path ../__init__.py
        sys.path.insert(0, path.abspath(path.dirname(path.dirname(f))))

        module = path.basename(path.dirname(f))
        return importlib.import_module(module)

    @property
    def resolved(self):
        return _resolve_plugin(self)


class DirectoryProductionPlugin(APlugin):
    def __init__(self, folder):
        self.folder = folder
        self.extensions = []
        if path.exists(path.join(folder, "buildInfo.json")):
            with open(path.join(folder, "buildInfo.json")) as f:
                pkg = json.load(f)
            self.id = pkg["name"]
            self.name = self.id
            desc = pkg.get("description", "").split("\n")
            self.title = desc.pop(0) if len(desc) > 1 else self.name
            self.description = "\n".join(desc)
            self.homepage = pkg.get("homepage")
            self.version = pkg["version"]
            self.repository = pkg.get("repository", "")
        else:
            self.id = path.basename(folder)
            self.name = self.id
            self.title = self.id
            self.description = ""
            self.homepage = ""
            self.version = ""
            self.repository = ""

    @staticmethod
    def is_app():
        return False

    def config_file(self) -> str | None:
        f = path.join(self.folder, "config.json")
        return f if path.exists(f) else None

    @lru_cache
    def get_module(self):
        f = path.join(self.folder, "__init__.py")
        if not path.exists(f):
            return False
        # append path ../__init__.py
        sys.path.insert(0, path.abspath(path.dirname(path.dirname(f))))

        module = path.basename(path.dirname(f))
        return importlib.import_module(module)

    @property
    def resolved(self):
        return self.version


def _find_entry_point_plugins():
    return [EntryPointPlugin(entry_point) for entry_point in iter_entry_points(group='phovea.registry')]

# def _find_entry_point_plugins():
#     dirs = [path.dirname(importlib.util.find_spec(ep.name).origin) for ep in iter_entry_points(group='phovea.registry')]
#     dirs = [d for d in dirs if path.exists(path.join(d, "config.json"))]
#     return [p for p in [DirectoryProductionPlugin(pi) for pi in dirs] if p.id != "phovea_workspace"]


def _find_development_neighbor_plugins() -> List[DirectoryPlugin]:
    import glob
    import itertools

    prefix = ["./", "../", "../../"]
    suffix = ["", "p/", "public/"]
    files = []
    for pre, s in itertools.product(prefix, suffix):
        files.extend((path.abspath(pi) for pi in glob.glob(pre + s + "*/package.json")))
    # files contains all plugins
    # This method also finds the workspace package.json, and creates a plugin from that...
    return [p for p in [DirectoryPlugin(pi) for pi in files] if p.id != "phovea_workspace"]


def _find_production_neighbor_plugins() -> List[DirectoryProductionPlugin]:
    import glob

    base_dir = path.dirname(path.dirname(__file__))
    # all dirs having both __init__.py and config.json contained
    dirs = [path.dirname(path.abspath(pi)) for pi in glob.glob(base_dir + "/*/__init__.py")]
    dirs = [d for d in dirs if path.exists(path.join(d, "config.json"))]
    # files contains all plugins
    return [p for p in [DirectoryProductionPlugin(pi) for pi in dirs] if p.id != "phovea_workspace"]


def load_all_plugins() -> List[APlugin]:
    plugins: List[APlugin] = []

    # TODO: Load entry point plugins
    # plugins.extend(p for p in _find_entry_point_plugins() if not is_disabled_plugin(p))

    if get_global_settings().is_development_mode:
        _log.info("Looking for development neighbors")
        neighbors = _find_development_neighbor_plugins()
    else:
        _log.info("Looking for production neighbors")
        neighbors = _find_production_neighbor_plugins()

    plugins.extend(p for p in neighbors if not is_disabled_plugin(p))
    plugins.sort(key=lambda p: p.id)

    _log.info(f"Discovered {len(plugins)} plugins: {', '.join([d.id for d in plugins])}")

    return plugins


def get_extensions_from_plugins(plugins: List[APlugin]) -> List:
    server_extensions = []
    for plugin in plugins:
        reg = RegHelper(plugin)
        plugin.register(reg)
        ext = [r for r in reg if not is_disabled_extension(r, "python", plugin)]
        logging.info(f'plugin {plugin.id} registered {len(ext)} extension(s)')
        plugin.extensions = ext
        server_extensions.extend(ext)

    return server_extensions


def get_config_from_plugins(plugins: List[APlugin]) -> Tuple[List[Dict[str, Dict]], Dict[str, Type[BaseSettings]]]:
    from ..settings.utils import load_config_file

    # With all the plugins, load the corresponding configuration files and add them to the global config
    files: List[Dict[str, Dict]] = []
    models: Dict[str, Type[BaseSettings]] = {}
    for plugin in plugins:
        plugin_module = plugin.get_module()
        if hasattr(plugin_module, 'visyn_settings_model'):
            plugin_settings_model = plugin_module.visyn_settings_model()
            if plugin_settings_model:
                logging.info(f'Plugin {plugin.id} has a settings model')
                # Load the class of the config and wrap it in a tuple like (<clazz>, ...),
                # such that pydantic can use it as type-hint in the create_model class.
                # Otherwise, it would except <clazz> to be the default value...
                models[plugin.id] = (plugin_settings_model, ...)
        else:
            # Load actual config.json
            f = plugin.config_file()
            if f:
                logging.info(f'Plugin {plugin.id} has a config.json')
                files.append({f"{plugin.id}": load_config_file(f)})

    return (files, models)
