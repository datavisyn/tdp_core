import codecs
import logging
import os
from typing import Any, Dict

import jsoncfg

_log = logging.getLogger(__name__)


def load_workspace_config() -> Dict[str, Any]:
    """
    Loads the global config.json placed at `PHOVEA_CONFIG_PATH` (defaults to `config.json`).
    """
    global_ = os.path.abspath(os.environ.get("PHOVEA_CONFIG_PATH", "/phovea/config.json"))

    if os.path.exists(global_):
        _log.info(f"Loading workspace config.json from {global_}")
        return load_config_file(global_)
    else:
        _log.info(f"No {global_} found, using empty dict")
        return {}


def load_config_file(path: str) -> Dict[str, Any]:
    """
    Opens any `*.json` file and loads it via `jsoncfg.loads`.
    """
    with codecs.open(path, "r", "utf-8") as fi:
        return jsoncfg.loads(fi.read()) or {}
