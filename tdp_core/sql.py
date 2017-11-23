from phovea_server.ns import Namespace, request, abort, Response
from . import db
from .utils import map_scores
from phovea_server.util import jsonify
from phovea_server.security import login_required
import logging

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)
app = Namespace(__name__)


def load_ids(idtype, mapping):
  import phovea_server.plugin

  manager = phovea_server.plugin.lookup('idmanager')
  manager.load(idtype, mapping)


@app.route('/')
@login_required
def list_database():
  return jsonify([v[0].dump(k) for k, v in db.configs.items()])


@app.route('/<database>/')
@login_required
def list_view(database):
  config_engine = db.resolve(database)
  if not config_engine:
    return 404, 'Not Found'
  return jsonify([v.dump(k) for k, v in config_engine[0].views.items()])


def _assign_ids(r, view):
  return r and (request.args.get('_assignids', False) or (view.assign_ids and '_id' not in r[0]))


def _return_query():
  return request.args.get('_return_query', False)


def _formatCsv(array_of_dicts):
  import pandas as pd
  import io

  if not array_of_dicts:
    return Response('', mimetype='text/csv')

  out = io.BytesIO()
  d = pd.DataFrame.from_records(array_of_dicts)
  d.to_csv(out, sep='\t', encoding='utf-8', index = False)
  return Response(out.getvalue(), mimetype='text/csv')


def _formatter(view_name):
  if view_name.endswith('.csv'):
    return view_name[:-4], _formatCsv
  return view_name, jsonify


@app.route('/<database>/<view_name>')
@login_required
def get_data_api(database, view_name):
  view_name, format = _formatter(view_name)
  if _return_query():
    return jsonify(db.get_query(database, view_name, None, request.args))

  r, view = db.get_data(database, view_name, None, request.args)

  if _assign_ids(r, view):
    r = db.assign_ids(r, view.idtype)
  return format(r)


@app.route('/<database>/<view_name>/filter')
@login_required
def get_filtered_data(database, view_name):
  """
  version of getting data in which the arguments starting with `filter_` are used to build a where clause
  :param database:
  :param view_name:
  :return:
  """
  view_name, format = _formatter(view_name)
  if _return_query():
    return jsonify(db.get_filtered_query(database, view_name, request.args))

  r, view = db.get_filtered_data(database, view_name, request.args)

  if _assign_ids(r, view):
    r = db.assign_ids(r, view.idtype)
  return format(r)


@app.route('/<database>/<view_name>/score')
@login_required
def get_score_data(database, view_name):
  """
  version of getting data like filter with additional mapping of score entries
  :param database:
  :param view_name:
  :return:
  """
  view_name, format = _formatter(view_name)
  if _return_query():
    return jsonify(db.get_filtered_query(database, view_name, request.args))

  r, view = db.get_filtered_data(database, view_name, request.args)

  data_idtype = view.idtype
  target_idtype = request.args.get('target', data_idtype)

  if data_idtype != target_idtype:
    mapped_scores = map_scores(r, data_idtype, target_idtype)
  else:
    mapped_scores = r

  if _assign_ids(mapped_scores, view):
    mapped_scores = db.assign_ids(mapped_scores, target_idtype)
  return format(mapped_scores)


@app.route('/<database>/<view_name>/count')
@login_required
def get_count_data(database, view_name):
  """
  similar to the /filter clause but returns the count of results instead of the rows itself
  :param database:
  :param view_name:
  :return:
  """
  view_name, _ = _formatter(view_name)
  if _return_query():
    return jsonify(db.get_count_query(database, view_name, request.args))

  r = db.get_count(database, view_name, request.args)

  return jsonify(r)


@app.route('/<database>/<view_name>/desc')
@login_required
def get_desc(database, view_name):
  view_name, _ = _formatter(view_name)
  config, _ = db.resolve(database)
  # convert to index lookup
  # row id start with 1
  if view_name not in config.views:
    abort(404)

  view = config.views[view_name]

  return jsonify(dict(idType=view.idtype, columns=view.columns.values()))


@app.route('/<database>/<view_name>/lookup')
@login_required
def lookup(database, view_name):
  """
  Does the same job as search, but paginates the result set
  This function is used in conjunction with Select2 form elements
  """
  view_name, _ = _formatter(view_name)
  query = str(request.args.get('query', '')).lower()
  page = int(request.args.get('page', 0))  # zero based
  limit = int(request.args.get('limit', 30))  # or 'all'

  if _return_query():
    return db.lookup_query(database, view_name, query, page, limit, request.args)

  r_items, more, view = db.lookup(database, view_name, query, page, limit, request.args)

  if _assign_ids(r_items, view):
    r_items = db.assign_ids(r_items, view.idtype)
  return jsonify(dict(items=r_items, more=more))


def create():
  """
   entry point of this plugin
  """
  app.debug = True
  return app
