import operator
from functools import reduce

from marshmallow import fields
from marshmallow.fields import String

from . import FieldFilterMixin, Filter

ALLOWED_OPERATORS = {"and": operator.and_, "or": operator.or_}


class Group(Filter, FieldFilterMixin):
    operator = String(required=True, validate=lambda o: o in ALLOWED_OPERATORS)
    children = fields.List(fields.Dict)

    def postload(self, data, children, operator, **_):
        if not children:
            return lambda _: True
        children = [Filter().load(child) for child in children]
        return lambda d: reduce(ALLOWED_OPERATORS[operator], [child(d) for child in children])
