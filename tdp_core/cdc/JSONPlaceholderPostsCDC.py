from typing import Dict
from .BaseCDC import BaseCDC
import requests


class JSONPlaceholderPostsCDC(BaseCDC):
    @property
    def id(self):
        return 'JSONPlaceholderPostsCDC'

    def load_data(self, options: Dict = {}):
        return requests.get('https://jsonplaceholder.typicode.com/posts').json()

    def get_id(self, item):
        return item['id']
