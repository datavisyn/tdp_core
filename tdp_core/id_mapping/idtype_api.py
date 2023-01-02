import logging

from flask import Flask, abort, jsonify, request

from .. import manager
from ..dataset.dataset_def import to_idtype_description

app_idtype = Flask(__name__)

_log = logging.getLogger(__name__)


@app_idtype.route("/")
def _list_idtypes():
    tmp = dict()
    # TODO: We probably don't want to have these idtypes as "all" idtypes
    # for d in list_datasets():
    #     for idtype in d.to_idtype_descriptions():
    #         tmp[idtype["id"]] = idtype

    # also include the known elements from the mapping graph
    for idtype_id in manager.id_mapping.known_idtypes():
        tmp[idtype_id] = to_idtype_description(idtype_id)
    return jsonify(list(tmp.values()))


@app_idtype.route("/<idtype>/")
def _maps_to(idtype):
    target_id_types = manager.id_mapping.maps_to(idtype)
    return jsonify(target_id_types)


@app_idtype.route("/<idtype>/<to_idtype>", methods=["GET", "POST"])
def _mapping_to(idtype, to_idtype):
    return _do_mapping(idtype, to_idtype)


@app_idtype.route("/<idtype>/<to_idtype>/search")
def _mapping_to_search(idtype, to_idtype):
    query = request.args.get("q", None)
    max_results = int(request.args.get("limit", 10))
    if hasattr(manager.id_mapping, "search"):
        return jsonify(manager.id_mapping.search(idtype, to_idtype, query, max_results))
    return jsonify([])


def _do_mapping(idtype, to_idtype):
    args = request.values
    first_only = args.get("mode", "all") == "first"

    if "q" in args:
        names = args["q"].split(",")
    elif "q[]" in args:
        names = args.getlist("q[]")
    else:
        abort(400)
        return

    mapped_list = manager.id_mapping(idtype, to_idtype, names)

    if first_only:
        mapped_list = [None if a is None or len(a) == 0 else a[0] for a in mapped_list]

    return jsonify(mapped_list)


def create_idtype():
    return app_idtype
