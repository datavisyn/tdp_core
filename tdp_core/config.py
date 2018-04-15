from phovea_server.ns import Namespace
from phovea_server.util import jsonify
from phovea_server.config import get as get_config
from phovea_server.plugin import list as list_plugins
import logging

app = Namespace(__name__)
_log = logging.getLogger(__name__)


@app.route('/<path:path>')
def _config(path):
  path = path.split('/')
  key = path[0]

  plugin = next((p for p in list_plugins('tdp-config-safe-keys') if p.id == key), None)
  if not plugin:
    return 404, 'key not found'

  path[0] = plugin.configKey
  return jsonify(get_config('.'.join(path)))


def create():
  return app
