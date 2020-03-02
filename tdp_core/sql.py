from phovea_server.ns import Namespace, request, abort, no_cache
from . import db
from .utils import map_scores
from phovea_server.util import jsonify
from .security import tdp_login_required
from .formatter import formatter
import logging
from functools import wraps

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)
app = Namespace(__name__)


def load_ids(idtype, mapping):
  import phovea_server.plugin

  manager = phovea_server.plugin.lookup('idmanager')
  manager.load(idtype, mapping)


def _view_no_cache(func):
  """
  wrap the function in no_cache if the view identified by view_name has the no_cache flag set
  """
  @wraps(func)
  def decorated_view(*args, **kwargs):
    if kwargs.get('view_name', None) is not None and kwargs.get('database', None) is not None:
      view_name, _ = formatter(kwargs['view_name'])
      config, _, view = db.resolve_view(kwargs['database'], view_name)
      if view.no_cache:
        return no_cache(func)(*args, **kwargs)
    return func(*args, **kwargs)
  return decorated_view


@app.route('/')
@tdp_login_required
def list_database():
  return jsonify([v.dump(k) for k, v in db.configs.connectors.items()])


@app.route('/<database>/')
@tdp_login_required
def list_view(database):
  config_engine = db.resolve(database)
  if not config_engine:
    return abort(404, 'Not Found')
  return jsonify([v.dump(k) for k, v in config_engine[0].views.items() if v.can_access()])


def _assign_ids(r, view):
  return r and (request.values.get('_assignids', False) or (view.assign_ids and '_id' not in r[0]))


def _return_query():
  # return true if the key is given and the value doesn't start with 'f' -> no value, true, True, T
  key = '_return_query'
  if key not in request.values:
    return False
  v = request.values[key]
  return not v or v.lower()[0] != 'f'


@app.route('/<database>/<view_name>', methods=['GET', 'POST'])
@app.route('/<database>/<view_name>/filter', methods=['GET', 'POST'])
@tdp_login_required
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

  if _assign_ids(r, view):
    r = db.assign_ids(r, view.idtype)
  return format(r)


@app.route('/<database>/<view_name>/score', methods=['GET', 'POST'])
@tdp_login_required
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
  target_idtype = request.values.get('target', data_idtype)

  if data_idtype != target_idtype:
    mapped_scores = map_scores(r, data_idtype, target_idtype)
  else:
    mapped_scores = r

  if _assign_ids(mapped_scores, view):
    mapped_scores = db.assign_ids(mapped_scores, target_idtype)
  return format(mapped_scores)


@app.route('/<database>/<view_name>/count', methods=['GET', 'POST'])
@tdp_login_required
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


@app.route('/<database>/<view_name>/desc')
@tdp_login_required
@_view_no_cache
def get_desc(database, view_name):
  view_name, _ = formatter(view_name)
  config, _, view = db.resolve_view(database, view_name)
  return jsonify(view.dump(view_name))


@app.route('/<database>/<view_name>/lookup', methods=['GET', 'POST'])
@tdp_login_required
@_view_no_cache
def lookup(database, view_name):
  """
  Does the same job as search, but paginates the result set
  This function is used in conjunction with Select2 form elements
  """
  view_name, _ = formatter(view_name)
  query = request.values.get('query', '').lower()
  page = int(request.values.get('page', 0))  # zero based
  limit = int(request.values.get('limit', 30))  # or 'all'

  if _return_query():
    return db.lookup_query(database, view_name, query, page, limit, request.values)

  r_items, more, view = db.lookup(database, view_name, query, page, limit, request.values)

  if _assign_ids(r_items, view):
    r_items = db.assign_ids(r_items, view.idtype)
  return jsonify(dict(items=r_items, more=more))


def create():
  """
   entry point of this plugin
  """
  app.debug = True
  return app
