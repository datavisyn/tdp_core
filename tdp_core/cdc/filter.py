from functools import reduce
from operator import and_, or_, eq
from re import match
from typing import Dict, List, Any, Callable
from marshmallow import Schema, post_load, INCLUDE, fields, ValidationError


class Filter(Schema):
  """ Filter baseclass to delegate to children """
  class Meta:
    unknown = INCLUDE

  id = fields.String(required=True)
  type = fields.String(required=False)  # "type" of the filter: group, checkbox, text...

  @post_load()
  def _postload(self, data: Dict, **_) -> Callable:
    """ Call a postload function in every sub-class """
    return self.postload(data, **data)

  def postload(self, data: Dict, type: str, **_) -> Callable:
    """ Delegate to a subclass based on type field """
    filters = {f.__name__.lower(): f for f in Filter.__subclasses__()}
    if type not in filters:
      raise ValidationError(f"Filter type {type} doesn't exist in {list(filters.keys())}", field_name="type")
    sub_cls = filters[type]
    return sub_cls().load(data)


class FieldFilterMixin:
  """ Mixin for filters that access a field in the input-data.
  Supports simple attributes, sub.attributes or indexed[0], as as well as .len """
  field = fields.String(required=True)

  @staticmethod
  def access(item, field: str) -> Any:
    for field_name in field.split("."):
      if field_name.startswith("_"):
        raise ValidationError("Private access detected.", field_name='field')
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
  children = fields.List(fields.Dict)

  # noinspection PyMethodOverriding
  def postload(self, data: Dict, children: List, operator: str, **_):
    children = [Filter().load(child) for child in children]
    op = ALLOWED_OPERATORS[operator]
    return lambda d: reduce(op, [child(d) for child in children]) if children else True


class Range(Filter, FieldFilterMixin):
  value = fields.Dict(fields.String(), fields.Number)

  # noinspection PyMethodOverriding
  def postload(self, data, field: str, value: Dict, **_):
    if "min" not in value or "max" not in value:
      raise ValidationError("Range did not contain min or max.", field_name="value")
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
