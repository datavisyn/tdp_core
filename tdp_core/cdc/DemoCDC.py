from typing import Dict
from .BaseCDC import BaseCDC
import requests 
import logging

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