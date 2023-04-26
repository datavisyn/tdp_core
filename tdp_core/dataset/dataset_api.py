import logging

from flask import Flask, abort, make_response, request
from flask.wrappers import Response
from visyn_core import manager

from ..utils import jsonify, to_json
from .dataset import add, get, iter, list_datasets, remove

app = Flask(__name__)

_log = logging.getLogger(__name__)


@app.errorhandler(ValueError)
def on_value_error(error):
    _log.error("ValueError: (" + str(error) + ") at " + str(request.environ))
    _log.error(error)
    return (
        "<strong>{} - {}</strong><pre>{}</pre>".format(500, "ValueError", error),
        500,
    )


def _list_format_json(data):
    return jsonify(data)


def _list_format_treejson(data):
    r = {}
    for d in data:
        levels = d["fqname"].split("/")
        act = r
        for level in levels[:-1]:
            if level not in act:
                act[level] = {}
            act = act[level]
        act[d["name"]] = d
    return jsonify(r, indent=1)


def _list_format_csv(data):
    delimiter = request.args.get("f_delimiter", ";")

    def to_size(size):
        if size is None:
            return ""
        if isinstance(size, list):
            return ",".join(str(d) for d in size)
        return str(size)

    def gen():
        yield delimiter.join(["ID", "Name", "FQName", "Type", "Size", "Entry"]) # type: ignore
        for d in data:
            yield "\n"
            yield delimiter.join( # type: ignore
                [
                    str(d["id"]),
                    d["name"],
                    d["fqname"],
                    d["type"],
                    to_size(d.get("size", None)),
                    to_json(d),
                ]
            )

    return Response(
        gen(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=dataset.csv"},
    )


def _to_query(query):
    keys = ["name", "id", "fqname", "type"]
    act_query = {k: v for k, v in query.items() if k in keys}
    if len(act_query) == 0:  # no query
        return lambda x: True
    import re

    def filter_elem(elem):
        return all((re.match(v, getattr(elem, k, "")) for k, v in act_query.items()))

    return filter_elem


@app.route("/", methods=["GET", "POST"])
def _list_datasets():
    if request.method == "GET":
        query = _to_query(request.values)
        data = [d.to_description() for d in iter() if query(d)]

        limit = request.values.get("limit", -1)
        if 0 < int(limit) < len(data): # type: ignore
            data = data[:limit]

        format = request.args.get("format", "json")
        formats = {"json": _list_format_json, "treejson": _list_format_treejson, "csv": _list_format_csv}
        if format not in formats:
            abort(
                make_response(
                    'invalid format: "{}" possible ones: {}'.format(format, ",".join(list(formats.keys()))),
                    400,
                )
            )
        return formats[format](data) # type: ignore
    else:
        return _upload_dataset(request)


@app.route("/<dataset_id>", methods=["PUT", "GET", "DELETE", "POST"])
def _get_dataset(dataset_id):
    if request.method == "PUT":
        return _update_dataset(dataset_id, request)
    elif request.method == "POST":
        return _modify_dataset(dataset_id, request)
    elif request.method == "DELETE":
        return _remove_dataset(dataset_id)
    d = get(dataset_id)
    if d is None:
        return 'invalid dataset id "' + str(dataset_id) + '"', 404
    if not d.can_read():
        return "not allowed", 403
    return jsonify(d.asjson())


@app.route("/<dataset_id>/desc")
def _get_dataset_desc(dataset_id):
    d = get(dataset_id)
    if not d:
        return 'invalid dataset id "' + str(dataset_id) + '"', 404
    if not d.can_read():
        return "not allowed", 403
    return jsonify(d.to_description())


def _dataset_getter(dataset_id, dataset_type):
    if isinstance(dataset_id, int) and dataset_id < 0:
        return [d for d in list_datasets() if d.type == dataset_type]
    t = get(dataset_id)
    if t is None:
        abort(404, 'invalid dataset id "' + str(dataset_id) + '"')
    if t.type != dataset_type:
        abort(400, 'the given dataset "' + str(dataset_id) + '" is not a ' + dataset_type)
    if not t.can_read():
        abort(403, "not allowed")
    return t


def _to_upload_desc(data_dict):
    if "desc" in data_dict:
        import json

        return json.loads(data_dict["desc"])
    return data_dict


def _upload_dataset(request, id=None):
    try:
        # first choose the provider to handle the upload
        r = add(_to_upload_desc(request.values), request.files, id)
        if r:
            return jsonify(r.to_description(), indent=1)
        # invalid upload
        return "invalid upload", 400
    except ValueError as e:
        return on_value_error(e)


def _update_dataset(dataset_id, request):
    try:
        old = get(dataset_id)
        if old is None:
            return _upload_dataset(request, dataset_id)
        if not old.can_write():
            return "not allowed", 403
        r = old.update(_to_upload_desc(request.values), request.files)
        if r:
            return jsonify(old.to_description(), indent=1)
        # invalid upload
        return "invalid upload", 400
    except ValueError as e:
        return on_value_error(e)


def _modify_dataset(dataset_id, request):
    try:
        old = get(dataset_id)
        if old is None:
            return 'invalid dataset id "' + str(dataset_id) + '"', 404
        if not old.can_write():
            return "not allowed", 403
        r = old.modify(_to_upload_desc(request.values), request.files)
        if r:
            return jsonify(old.to_description(), indent=1)
            # invalid upload
        return "invalid upload", 400
    except ValueError as e:
        return on_value_error(e)


def _remove_dataset(dataset_id):
    dataset = get(dataset_id)
    if dataset is None:
        return 'invalid dataset id "' + str(dataset_id) + '"', 404
    if not dataset.can_write():
        return "not allowed", 403
    r = remove(dataset_id)
    if r:
        return jsonify(
            {
                "state": "success",
                "msg": "Successfully deleted dataset " + dataset_id,
                "id": dataset_id,
            },
            indent=1,
        )
    return "invalid request", 400


# add all specific handler
for handler in manager.registry.list("dataset-specific-handler"):
    p = handler.load()
    p(app, _dataset_getter)


def create_dataset():
    return app
