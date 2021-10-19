from typing import Dict
from .BaseCDC import BaseCDC
from phovea_server.util import jsonify
import requests 
import logging
from deepdiff import DeepDiff

_log = logging.getLogger(__name__)


class DemoCDC(BaseCDC):
    @property
    def id(self):
        return 'demo'

    def load_data(self, options: Dict = {}):
        _log.info('Loading up-to-date data')
        return requests.get('https://jsonplaceholder.typicode.com/users').json()

    def get_id(self, item):
        _log.info(item)
        return item['id']

    def compare(self, old, new):
        old = old or []
        new = new or []
        old_lookup = {self.get_id(item): item for item in old}
        new_lookup = {self.get_id(item): item for item in new}
        return DeepDiff(old_lookup, new_lookup).to_json()