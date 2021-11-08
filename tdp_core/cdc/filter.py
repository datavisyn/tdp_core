from re import match
from operator import and_, or_, eq
from functools import reduce
from typing import Dict, Callable, List, Any

from marshmallow import Schema, post_load, INCLUDE, fields


# This class contains all filters to avoid cyclic dependencies
class Filter(Schema):
  """ Filter baseclass to delegate to children """
  class Meta:
    unknown = INCLUDE

  id = fields.String(required=True)
  name = fields.String(required=True)
  componentId = fields.String(required=False)  # "type" of the filter: group, checkbox, text...

  @post_load()
  def _postload(self, data, **_) -> Callable:
    """ Call a postload function in every sub-class """
    return self.postload(data, **data)

  # noinspection PyMethodMayBeStatic
  def postload(self, data, componentId, **_) -> Callable:
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
  def access(item, field) -> Any:
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



ALLOWED_OPERATORS = {"AND": and_, "OR": or_}
class Group(Filter):
  operator = fields.String(required=True, validate=lambda o: o in ALLOWED_OPERATORS)
  children = fields.Nested(Filter, many=True)

  # noinspection PyMethodMayBeStatic
  def postload(self, data, children, operator, **_):
    if not children:
      return lambda _: True
    children = [Filter().load(child)["filt"] for child in children]
    op = ALLOWED_OPERATORS[operator]
    return lambda d: reduce(op, [child(d) for child in children])


class Range(Filter, FieldFilterMixin):
  min = fields.Number()
  max = fields.Number()

  # noinspection PyMethodMayBeStatic
  def postload(self, data, field, min, max, **_):
    return lambda item: min <= FieldFilterMixin.access(item, field) <= max


class Text(Filter, FieldFilterMixin):
  """ Filter for textfields to match """
  values = fields.List(fields.String(), required=True)
  match_case = fields.Boolean(required=False, missing=False)
  match_exact = fields.Boolean(required=False, missing=False)

  # noinspection PyMethodMayBeStatic
  def postload(self, data, field, values, match_case, match_exact, **_):
    compare = eq if match_exact else str.__contains__
    if match_case:
      compare = compare(b.lower(), a.lower())
    return lambda item: any(compare(FieldFilterMixin.access(item, field), value) for value in values)


class Checkbox(Filter):
  """ TODO: not sure for what? """
