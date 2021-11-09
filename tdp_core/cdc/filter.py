from functools import reduce
from operator import and_, or_, eq
from re import match
from typing import Dict, List, Any

from marshmallow import Schema, post_load, INCLUDE, fields


# This method contains all filter classes to avoid cyclic dependencies
class Filter(Schema):
  """ Filter baseclass to delegate to children """

  class Meta:
    unknown = INCLUDE

  id = fields.String(required=True)
  name = fields.String(required=True)
  componentId = fields.String(required=False)  # "type" of the filter: group, checkbox, text...

  @post_load()
  def _postload(self, data: Dict, **_) -> Dict:
    """ Call a postload function in every sub-class """
    return self.postload(data, **data)

  def postload(self, data: Dict, componentId: str, **_) -> Dict:
    """ Delegate to a subclass based on componentId field """
    filters = {f.__name__.lower(): f for f in Filter.__subclasses__()}
    assert componentId in filters, f"Error: Filter type {componentId} doesn't exist in {filters.values()}"
    sub_cls = filters[componentId]
    data["filt"] = sub_cls().load(data)
    data["apply"] = lambda items: list(filter(data["filt"], items))
    return data


class FieldFilterMixin:
  """ Mixin for filters that access a field in the input-data.
  Supports simple attributes, sub.attributes or indexed[0], as as well as .len """
  field = fields.String(required=True)

  @staticmethod
  def access(item, field: str) -> Any:
    for field_name in field.split("."):
      assert not field_name.startswith("_"), "Private access detected."

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
    children = [Filter().load(child)["filt"] for child in children]
    op = ALLOWED_OPERATORS[operator]
    return lambda d: reduce(op, [child(d) for child in children])


class Range(Filter, FieldFilterMixin):
  min = fields.Number()
  max = fields.Number()

  # noinspection PyMethodOverriding, PyShadowingBuiltins
  def postload(self, data, field: str, min: float, max: float, **_):
    return lambda item: min <= FieldFilterMixin.access(item, field) <= max


class Text(Filter, FieldFilterMixin):
  """ Filter for textfields to match """
  values = fields.List(fields.String(), required=True)
  match_case = fields.Boolean(required=False, missing=False)
  match_exact = fields.Boolean(required=False, missing=False)

  # noinspection PyMethodOverriding
  def postload(self, data: Dict, field: str, values: List[str], match_case: bool, match_exact: bool, **_):
    compare = eq if match_exact else str.__contains__
    if match_case:
      compare = lambda a, b: compare(b.lower(), a.lower())  # nopep8    # ignore lambda assign
    return lambda item: any(compare(FieldFilterMixin.access(item, field), value) for value in values)


class Checkbox(Filter):
  values = fields.Dict(fields.String(), fields.Boolean(), required=True)

  # noinspection PyMethodOverriding
  def postload(self, data, values: Dict[str, bool], **_):
    return lambda item: all([FieldFilterMixin.access(item, key) == value
                             for key, value in values.items()])
