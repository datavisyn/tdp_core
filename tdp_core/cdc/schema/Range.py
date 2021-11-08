from marshmallow.fields import String, Number

from . import FieldFilterMixin, Filter

class Range(Filter, FieldFilterMixin):
    field = String(required=True, validate=lambda s: not s.startswith("_") and not "._" in s)
    min = Number()
    max = Number()

    def postload(self, data, field, min, max, **_):
        return lambda item: min < FieldFilter.access(item, field) < max
