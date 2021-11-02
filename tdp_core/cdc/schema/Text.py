import operator

from marshmallow.fields import String, Boolean

from . import Filter, FieldFilterMixin


class Text(Filter, FieldFilterMixin):
    """ Filter for textfields to match """
    value = String(required=True)
    match_case = Boolean(required=False, missing=False)
    match_exact = Boolean(required=False, missing=False)

    def postload(self, data, field, value, match_case, match_exact, **_):
        compare = operator.eq if match_exact else str.__contains__
        if match_case:
            compare = lambda a, b: print(a, b)    # compare(b.lower(), a.lower())
        return lambda item: compare(FieldFilter.access(item, field), value)
