from typing import Dict
from .BaseCDC import BaseCDC
import requests


class JSONPlaceholderUserCDC(BaseCDC):
    @property
    def id(self):
        return 'JSONPlaceholderUserCDC'

    def load_data(self, options: Dict = {}):
        users = requests.get('https://jsonplaceholder.typicode.com/users').json()
        # users[4]['name'] = 'Max Mustermann'
        return users

    def get_id(self, item):
        return item['id']
