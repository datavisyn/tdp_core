from functools import reduce
from operator import and_, or_, eq
from re import match
from typing import Dict, List, Any
from marshmallow import Schema, post_load, INCLUDE, fields


# Create a subclass of dict to allow adding arbitrary attributes
class MyDict(dict):
    pass


# This method contains all filter classes to avoid cyclic dependencies
class Filter(Schema):
  """ Filter baseclass to delegate to children """

  class Meta:
    unknown = INCLUDE

  id = fields.String(required=True)
  type = fields.String(required=False)  # "type" of the filter: group, checkbox, text...

  @post_load()
  def _postload(self, data: Dict, **_) -> Dict:
    """ Call a postload function in every sub-class """
    return self.postload(data, **data)

  def postload(self, data: Dict, type: str, **_) -> Dict:
    """ Delegate to a subclass based on type field """
    filters = {f.__name__.lower(): f for f in Filter.__subclasses__()}
    assert type in filters, f"Error: Filter type {type} doesn't exist in {filters.values()}"
    sub_cls = filters[type]
    filt = sub_cls().load(data)
    # Create a MyDict to allow adding attributes
    new_data = MyDict(**data)
    # _private attributes so it doesn't get serialized
    setattr(new_data, '_filt', filt)
    setattr(new_data, '_apply', lambda items: list(filter(filt, items)))
    return new_data


class FieldFilterMixin:
  """ Mixin for filters that access a field in the input-data.
  Supports simple attributes, sub.attributes or indexed[0], as as well as .len """
  field = fields.String(required=True)

  @staticmethod
  def access(item, field: str) -> Any:
    for field_name in field.split("."):
      assert not field_name.startswith("_"), "Private access detected."
      if item is None:
        return None

      # get array-calls
      m = match(r"(.*)\[(.*)\\]", field)

      if m:
        field_name, field_idx = m.groups()
        item = getattr(item, field_name).__getitem__(field_idx)
      elif field_name == "len":
        item = len(item)
      else:
        item = item.get(field_name)
    return item


ALLOWED_OPERATORS = {"AND": and_, "OR": or_}


class Group(Filter):
  operator = fields.String(required=True, validate=lambda o: o in ALLOWED_OPERATORS)
  children = fields.Nested(Filter, many=True)

  # noinspection PyMethodOverriding
  def postload(self, data: Dict, children: List, operator: str, **_):
    if not children:
      return lambda _: True
    children = [Filter().load(child)._filt for child in children]
    op = ALLOWED_OPERATORS[operator]
    return lambda d: reduce(op, [child(d) for child in children])


class Range(Filter, FieldFilterMixin):
  value = fields.Dict(fields.String(), fields.Number)

  # noinspection PyMethodOverriding
  def postload(self, data, field: str, value: Dict, **_):
    assert "min" in value and "max" in value
    return lambda item: value["min"] <= FieldFilterMixin.access(item, field) <= value["max"]


class Text(Filter, FieldFilterMixin):
  """ Filter for textfields to match """
  value = fields.List(fields.String(), required=True)
  match_case = fields.Boolean(required=False, missing=False)
  match_exact = fields.Boolean(required=False, missing=False)

  # noinspection PyMethodOverriding
  def postload(self, data: Dict, field: str, value: List[str], match_case: bool, match_exact: bool, **_):
    compare = eq if match_exact else str.__contains__
    if match_case:
      compare = lambda a, b: compare(b.lower(), a.lower())  # NOQA E731
    return lambda item: any(compare(FieldFilterMixin.access(item, field), v) for v in value)


class Checkbox(Filter):
  value = fields.Dict(fields.String(), fields.Boolean(), required=True)

  # noinspection PyMethodOverriding
  def postload(self, data, value: Dict[str, bool], **_):
    return lambda item: all([FieldFilterMixin.access(item, key) == v
                             for key, v in value.items()])
