import json
import logging
from flask import render_template
from phovea_server.ns import Namespace
from phovea_server.security import login_required
from phovea_server.util import jsonify

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)
app = Namespace('flask_swagger_ui',
                static_folder='dist',
                template_folder='templates')


@app.route('/swagger.json')
@login_required
def _generate_swagger_file():
  import yaml
  from os import path

  here = path.abspath(path.dirname(__file__))
  base = path.join(here, 'swagger.yml')
  with open(base) as f:
    return jsonify(yaml.load(f))


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
