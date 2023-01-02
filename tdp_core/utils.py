import json
import logging
from builtins import range
from typing import Union

from flask import abort, make_response
from flask.wrappers import Response

from . import manager

_log = logging.getLogger(__name__)


secure_replacements = [
    "where",
    "and_where",
    "agg_score",
    "joins",
]  # has to be part of the computed replacements


def map_scores(scores, from_idtype, to_idtype):
    """
    maps the given scores from idtype to to idtype
    :param scores:
    :param from_idtype:
    :param to_idtype:
    :return: a mapped version of the scores
    """
    if len(scores) == 0:
        return []

    if not manager.id_mapping.can_map(from_idtype, to_idtype):
        abort(400, "score cannot be mapped to target")
    mapped_ids = manager.id_mapping(from_idtype, to_idtype, [r["id"] for r in scores])

    mapped_scores = []
    for score, mapped in zip(scores, mapped_ids):
        if not mapped:
            continue
        for target_id in mapped:
            clone = score.copy()
            clone["id"] = target_id
            mapped_scores.append(clone)
    return mapped_scores


def clean_query(query):
    if callable(query):
        return "custom function"
    import re

    q = query.strip()
    q_clean = re.sub(r"(\s)+", " ", q)
    return q_clean


# based on https://github.com/miguelgrinberg/oreilly-flask-apis-video/blob/master/orders/app/decorators/caching.py
def cache_control(*directives):
    """Insert a Cache-Control header with the given directives."""
    import functools

    def decorator(f):
        @functools.wraps(f)
        def wrapped(*args, **kwargs):
            # invoke the wrapped function
            rv = f(*args, **kwargs)

            # convert the returned value to a response object
            rv = make_response(rv)

            # insert the Cache-Control header and return response
            rv.headers["Cache-Control"] = ", ".join(directives)
            return rv

        return wrapped

    return decorator


def no_cache(f):
    """Insert a no-cache directive in the response. This decorator just
    invokes the cache-control decorator with the specific directives."""
    return cache_control("private", "no-cache", "no-store", "max-age=0")(f)


def fix_id(id):
    """
    fixes the id such that is it a resource identifier
    :param id:
    :return:
    """
    import re

    # convert strange characters to space
    r = re.sub(r"""[!#$%&'\(\)\*\+,\./:;<=>\?@\[\\\]\^`\{\|}~_]+""", " ", id)
    # title case all words
    r = r.title()
    r = r[0].lower() + r[1:]
    # remove white spaces
    r = re.sub(r"\s+", "", r, flags=re.UNICODE)
    return r


def random_id(length):
    import random
    import string

    s = string.ascii_lowercase + string.digits
    id = ""
    for i in range(0, length):
        id += random.choice(s)
    return id


class JSONExtensibleEncoder(json.JSONEncoder):
    """
    json encoder with extension point extensions
    """

    def __init__(self, *args, **kwargs):
        super(JSONExtensibleEncoder, self).__init__(*args, **kwargs)

        self.encoders = [p.load().factory() for p in manager.registry.list("json-encoder")]

    def default(self, o):
        for encoder in self.encoders:
            if o in encoder:
                return encoder(o, self)
        return super(JSONExtensibleEncoder, self).default(o)


def to_json(obj, *args, **kwargs):
    """
    convert the given object ot json using the extensible encoder
    :param obj:
    :param args:
    :param kwargs:
    :return:
    """
    if "allow_nan" in kwargs:
        del kwargs["allow_nan"]
    if "indent" in kwargs:
        del kwargs["indent"]
    kwargs["ensure_ascii"] = False

    # Pandas JSON module has been deprecated and removed. UJson cannot convert numpy arrays, so it cannot be used here. The JSON used here does not support the `double_precision` keyword.
    if isinstance(obj, float) or isinstance(obj, dict) or isinstance(obj, list):
        obj = _handle_nan_values(obj)
    return json.dumps(obj, cls=JSONExtensibleEncoder, *args, **kwargs)


def _handle_nan_values(obj_to_convert: Union[dict, list, float]) -> Union[dict, list, None]:
    """
    Convert any NaN values in the given object to None. Previously, Pandas was used to encode NaN to null. This feature has been deprecated and removed, therefore
    the standard JSON encoder is used which parses NaN instead of null. A custom JSON encoder does not work for converting these values to None because python's
    JSON encoder already knows how to serialize NaN values.
    :param obj_to_convert:
    :return dict, list or None:
    """
    import math

    converted_dict = {}
    converted_list = []
    # primitive value
    if isinstance(obj_to_convert, float) and math.isnan(obj_to_convert):
        return None
    # convert dictionaries
    if isinstance(obj_to_convert, dict):
        for k, v in obj_to_convert.items():
            # value is dictionary or list
            if isinstance(v, dict) or isinstance(v, list):
                converted_dict[k] = _handle_nan_values(v)
            else:
                # value is NaN
                if isinstance(v, float) and math.isnan(v):
                    converted_dict[k] = None
                else:
                    converted_dict[k] = v
        return converted_dict
    # convert lists
    elif isinstance(obj_to_convert, list):
        for elem in obj_to_convert:
            # list element is dictionary
            if isinstance(elem, dict):
                converted_list.append(_handle_nan_values(elem))
            # list element is NaN value
            elif isinstance(elem, float) and math.isnan(elem):
                converted_list.append(None)
            else:
                converted_list.append(elem)
        return converted_list


def jsonify(obj, *args, **kwargs):
    """
    similar to flask.jsonify but uses the extended json encoder and an arbitrary object
    :param obj:
    :param args:
    :param kwargs:
    :return:
    """
    return Response(to_json(obj, *args, **kwargs), mimetype="application/json; charset=utf-8")
