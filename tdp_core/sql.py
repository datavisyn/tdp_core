import logging
from functools import wraps

from flask import Flask, abort, jsonify, request

from . import db, manager
from .formatter import formatter
from .security import login_required_for_dbviews
from .utils import map_scores, no_cache

_log = logging.getLogger(__name__)
app = Flask(__name__)


def _view_no_cache(func):
    """
    wrap the function in no_cache if the view identified by view_name has the no_cache flag set
    """

    @wraps(func)
    def decorated_view(*args, **kwargs):
        if kwargs.get("view_name", None) is not None and kwargs.get("database", None) is not None:
            view_name, _ = formatter(kwargs["view_name"])
            config, _, view = db.resolve_view(kwargs["database"], view_name)
            if view.no_cache:
                return no_cache(func)(*args, **kwargs)
        return func(*args, **kwargs)

    return decorated_view


@app.route("/")
@login_required_for_dbviews
def list_database():
    return jsonify([v.dump(k) for k, v in manager.db.connectors.items()])


@app.route("/<database>/")
@login_required_for_dbviews
def list_view(database):
    config_engine = db.resolve(database)
    if not config_engine:
        return abort(404, "Not Found")
    return jsonify([v.dump(k) for k, v in config_engine[0].views.items() if v.can_access()])


def _return_query():
    # return true if the key is given and the value doesn't start with 'f' -> no value, true, True, T
    key = "_return_query"
    if key not in request.values:
        return False
    v = request.values[key]
    return not v or v.lower()[0] != "f"


@app.route("/<database>/<view_name>", methods=["GET", "POST"])
@app.route("/<database>/<view_name>/filter", methods=["GET", "POST"])
@login_required_for_dbviews
@_view_no_cache
def get_filtered_data(database, view_name):
    """
    version of getting data in which the arguments starting with `filter_` are used to build a where clause
    :param database:
    :param view_name:
    :return:
    """

    view_name, format = formatter(view_name)

    if _return_query():
        return jsonify(db.get_filtered_query(database, view_name, request.values))

    r, view = db.get_filtered_data(database, view_name, request.values)

    return format(r)


@app.route("/<database>/<view_name>/score", methods=["GET", "POST"])
@login_required_for_dbviews
@_view_no_cache
def get_score_data(database, view_name):
    """
    version of getting data like filter with additional mapping of score entries
    :param database:
    :param view_name:
    :return:
    """
    view_name, format = formatter(view_name)
    if _return_query():
        return jsonify(db.get_filtered_query(database, view_name, request.values))

    r, view = db.get_filtered_data(database, view_name, request.values)

    data_idtype = view.idtype
    target_idtype = request.values.get("target", data_idtype)

    mapped_scores = map_scores(r, data_idtype, target_idtype) if data_idtype != target_idtype else r

    return format(mapped_scores)


@app.route("/<database>/<view_name>/count", methods=["GET", "POST"])
@login_required_for_dbviews
@_view_no_cache
def get_count_data(database, view_name):
    """
    similar to the /filter clause but returns the count of results instead of the rows itself
    :param database:
    :param view_name:
    :return:
    """
    view_name, _ = formatter(view_name)
    if _return_query():
        return jsonify(db.get_count_query(database, view_name, request.values))

    r = db.get_count(database, view_name, request.values)

    return jsonify(r)


@app.route("/<database>/<view_name>/desc")
@login_required_for_dbviews
@_view_no_cache
def get_desc(database, view_name):
    view_name, _ = formatter(view_name)
    config, _, view = db.resolve_view(database, view_name)
    return jsonify(view.dump(view_name))


@app.route("/<database>/<view_name>/lookup", methods=["GET", "POST"])
@login_required_for_dbviews
@_view_no_cache
def lookup(database, view_name):
    """
    Does the same job as search, but paginates the result set
    This function is used in conjunction with Select2 form elements
    """
    view_name, _ = formatter(view_name)
    query = request.values.get("query", "").lower()
    page = int(request.values.get("page", 0))  # zero based
    limit = int(request.values.get("limit", 30))  # or 'all'

    if _return_query():
        return db.lookup_query(database, view_name, query, page, limit, request.values)

    r_items, more, view = db.lookup(database, view_name, query, page, limit, request.values)

    return jsonify({"items": r_items, "more": more})


def create():
    """
    entry point of this plugin
    """
    app.debug = True
    return app
