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

        _log.info(old_lookup)
        _log.info(new_lookup)

        old_ids = set(old_lookup.keys())
        new_ids = set(new_lookup.keys())

        added = new_ids - old_ids
        removed = old_ids - new_ids

        changed = set()
        unchanged = new_ids.intersection(old_ids)

        old_unchanged = [old_lookup[id] for id in unchanged]
        new_unchanged = [new_lookup[id] for id in unchanged]

        # {}
        # {1: {name: ..}, 2: {name: ...}}
        return DeepDiff(old_lookup, new_lookup).to_json()

        deep_diff = DeepDiff(old, new, group_by='id')

        # Added: dictionary_item_added
        # Field changed: values_changed, i.e. \"values_changed\": {\"root[6]['name']\": {\"new_value\": \"Mrs. Dennis Schulist\", \"old_value\": \"Hello world\"}}

        # deep_delta = Delta(deep_diff)

        return deep_diff.to_json()

        return {
            'added': list(added),
            'removed': list(removed),
            'changed': list(changed),
            'unchanged': list(unchanged)
        }
