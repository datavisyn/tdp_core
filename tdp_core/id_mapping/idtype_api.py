from ..utils import etag
import logging
from . import list_idtypes
from .manager import get_mappingmanager
from flask import Flask, request, abort, jsonify


app_idtype = Flask(__name__)

_log = logging.getLogger(__name__)


@app_idtype.route("/")
@etag
def _list_idtypes():
    return jsonify(list_idtypes())


@app_idtype.route("/<idtype>/")
@etag
def _maps_to(idtype):
    mapper = get_mappingmanager()
    target_id_types = mapper.maps_to(idtype)
    return jsonify(target_id_types)


@app_idtype.route("/<idtype>/<to_idtype>", methods=["GET", "POST"])
def _mapping_to(idtype, to_idtype):
    return _do_mapping(idtype, to_idtype)


@app_idtype.route("/<idtype>/<to_idtype>/search")
def _mapping_to_search(idtype, to_idtype):
    query = request.args.get("q", None)
    max_results = int(request.args.get("limit", 10))
    mapper = get_mappingmanager()
    if hasattr(mapper, "search"):
        return jsonify(mapper.search(idtype, to_idtype, query, max_results))
    return jsonify([])


def _do_mapping(idtype, to_idtype):
    mapper = get_mappingmanager()
    args = request.values
    first_only = args.get("mode", "all") == "first"

    if "q" in args:
        names = args["q"].split(",")
    elif "q[]" in args:
        names = args.getlist("q[]")
    else:
        abort(400)
        return

    mapped_list = mapper(idtype, to_idtype, names)

    if first_only:
        mapped_list = [None if a is None or len(a) == 0 else a[0] for a in mapped_list]

    return jsonify(mapped_list)


def create_idtype():
    return app_idtype
