import codecs
import os
from typing import Any, Dict

import jsoncfg


def load_workspace_config() -> Dict[str, Any]:
    """
    Loads the global config.json placed at `PHOVEA_CONFIG_PATH` (defaults to `config.json`).
    """
    global_ = os.path.abspath(os.environ.get("PHOVEA_CONFIG_PATH", "/phovea/config.json"))
    return load_config_file(global_) if os.path.exists(global_) else {}


def load_config_file(path: str) -> Dict[str, Any]:
    """
    Opens any `*.json` file and loads it via `jsoncfg.loads`.
    """
    with codecs.open(path, "r", "utf-8") as fi:
        return jsoncfg.loads(fi.read())
