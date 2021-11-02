from typing import Dict, Callable, List

from marshmallow import Schema, post_load, INCLUDE
from marshmallow.fields import String

FILTERS = {f.__name__.lower(): f for f in Filter.__subclasses__()}    # dict from classes


class Filter(Schema):
    """ Filter baseclass to delegate to children """

    class Meta:
        unknown = INCLUDE

    id = String(required=True)
    name = String(required=True)
    type = String(required=True)

    @post_load()
    def _postload(self, data, **kwargs) -> Callable:
        """ Call a postload function in every sub-class """
        return self.postload(data, **data)

    def postload(self, data, type, **_) -> Callable:
        """ Delegate to a subclass based on name/type field """
        assert type in FILTERS, f"Error: Filter type {type} doesn't exist in {FILTERS.values()}"
        sub_cls = FILTERS[type]
        return sub_cls().load(data)

    @staticmethod
    def apply(items, filt) -> List[Dict]:
        """ Apply a filter """
        filt = Filter().load(filt)
        return list(filter(filt, items))
