from phovea_server.ns import Namespace, abort
from phovea_server.util import jsonify
from .CDCManager import cdc_manager
import logging


_log = logging.getLogger(__name__)
app = Namespace(__name__)


@app.route('/', methods=['GET'])
def list_cdc():
  return jsonify([c.id for c in cdc_manager.cdcs])


@app.route('/<id>', methods=['GET'])
def execute_cdc(id: str):
  cdc = cdc_manager.getCDC(id)
  if not cdc:
    abort(404, f'No cdc with id {id} available')
  return cdc_manager.refreshCDC(cdc)


def create():
  return app
