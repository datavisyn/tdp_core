from re import match
from typing import Any

from marshmallow.fields import String


class FieldFilterMixin:
    """ Mixin for filters that access a field in the input-data.
    Supports simple attributes, sub.attributes or indexed[0], as as well as .len """
    field = String(required=True)

    @staticmethod
    def access(item, field: str) -> Any:
        # TODO: Return None if field does not exist?
        for field_name in field.split("."):
            assert not field_name.startswith("_"), "Private access detected."

            # get array-calls
            m = match("(.*)\[(.*)\\]", field)
            if m:
                field_name, field_idx = m.groups()
                item = getattr(item, field_name).__getitem__(field_idx)
            elif field_name == "len":
                item = len(item)
            else:
                item = item.get(field_name)
        return item

    def set(item, field: str, value: Any) -> Any:
        # TODO: static dict-setter with complex field
        return item