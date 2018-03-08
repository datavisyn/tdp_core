import json
import logging

from flask import render_template_string, render_template

from phovea_server.ns import Namespace, Response
from phovea_server.util import jsonify
from . import db
from .utils import secure_replacements

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)
app = Namespace('flask_swagger_ui',
                static_folder='dist',
                template_folder='templates')


def _gen():
  from yamlreader import yaml_load, data_merge
  from yaml import safe_load
  from os import path
  import io

  here = path.abspath(path.dirname(__file__))

  files = [path.join(here, 'swagger', p) for p in ['swagger.yml', 'db.yml', 'proxy.yml', 'storage.yml']]
  base = yaml_load(files)

  with io.open(path.join(here, 'swagger', 'view.tmpl.yml'), 'r', encoding='utf-8') as f:
    template = unicode(f.read())

  tags = base['tags']

  def to_type(t):
    if t is None:
      return 'string'
    if t is int:
      return 'integer'
    if t is float:
      return 'number'

  # integrate all views using the template
  for database, connector in db.configs.connectors.items():

    db.resolve(database)  # trigger filling up columns

    # add database tag
    tags.append(dict(name=u'db_' + database, description=connector.description or ''))

    for view, dbview in connector.views.items():
      # if database != u'dummy' or view != u'b_items_verify':
      #  continue
      args = []
      for arg in dbview.arguments:
        info = dbview.get_argument_info(arg)
        args.append(dict(name=arg, type=to_type(info.type), as_list=info.as_list, enum_values=None))

      for arg in (a for a in dbview.replacements if a not in secure_replacements):
        extra = dbview.valid_replacements.get(arg)
        arg_type = 'string'
        enum_values = None
        if isinstance(extra, list):
          enum_values = extra
        if extra == int or extra == float:
          arg_type = to_type(extra)
        args.append(dict(name=arg, type=arg_type, as_list=False, enum=enum_values))

      filters = set()

      if 'where' in dbview.replacements or 'and_where' in dbview.replacements:
        # filter possible
        for k in dbview.filters.keys():
          filters.add(k)
        if not filters:
          for k in dbview.columns.keys():
            filters.add(k)

      if 'agg_score' in dbview.replacements:
        # score query magic handling
        agg_score = connector.agg_score
        args.append(dict(name='agg', type='string', as_list=False, enum=agg_score.valid_replacements.get('agg')))

      props = []
      for k, prop in dbview.columns.items():
        p = prop.copy()
        p['name'] = k
        if 'type' not in p or p['type'] == 'categorical':
          p['type'] = 'string'
        props.append(p)

      if dbview.idtype:
        # assume when id type given then we have ids
        props.append(dict(name='_id', type='integer'))
        if not any((p['name'] == 'id' for p in props)):
          props.append(dict(name='id', type='string'))

      features = {
        'generic': dbview.query_type in ['generic', 'helper'],
        'desc': dbview.query_type in ['generic'],
        'lookup': dbview.query_type in ['lookup'],
        'count': dbview.query_type in ['generic'],
        'csv': dbview.query_type in ['generic'],
        'score': dbview.query_type in ['score']
      }

      keys = {
        'database': database,
        'view': view,
        'type': dbview.query_type,
        'description': dbview.description or '',
        'args': args,
        'empty': not args and not filters,
        'filters': filters,
        'features': features,
        'props': props
      }

      _log.info('%s', (keys,))

      view_yaml = render_template_string(template, **keys)
      # _log.info(view_yaml)
      part = safe_load(view_yaml)
      base = data_merge(base, part)

  return base


@app.route('/swagger.yaml')
def _generate_swagger_yml():
  from yaml import dump
  return Response(dump(_gen()), mimetype='text/vnd.yaml')


@app.route('/swagger.json')
def _generate_swagger_json():
  return jsonify(_gen())


@app.route('/')
@app.route('/<path:path>')
def show(path=None):
  if not path or path == 'index.html':
    fields = {
      # Some fields are used directly in template
      'base_url': '.',
      'app_name': 'Target Discovery Platform API',
      # Rest are just serialized into json string for inclusion in the .js file
      'config_json': json.dumps({
        'app_name': 'Swagger UI',
        'dom_id': '#swagger-ui',
        'url': './swagger.json',
        'layout': 'StandaloneLayout'
      }),
    }
    return render_template('index.template.html', **fields)
  return app.send_static_file(path)


def create():
  return app
