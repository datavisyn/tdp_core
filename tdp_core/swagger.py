import json
import logging

from flask import render_template_string, render_template

from phovea_server.ns import Namespace, Response
from phovea_server.security import login_required
from phovea_server.util import jsonify
from . import db

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

  # integrate all views using the template
  for database, connector in db.configs.connectors.items():

    # add database tag
    tags.append(dict(name=u'db_' + database, description=connector.description))

    for view, dbview in connector.views.items():
      keys = {
        'database': database,
        'view': view,
        'description': dbview.description,
        'args': dbview.arguments
      }

      # TODO argument types, filter

      view_yaml = render_template_string(template, **keys)
      part = safe_load(view_yaml)
      base = data_merge(base, part)

  return base


@app.route('/swagger.yaml')
@login_required
def _generate_swagger_yml():
  from yaml import dump
  return Response(dump(_gen()), mimetype='text/vnd.yaml')


@app.route('/swagger.json')
@login_required
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
