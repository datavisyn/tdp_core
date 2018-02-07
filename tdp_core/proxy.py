from phovea_server.ns import Namespace, Response, request, abort
import requests
import logging


_log = logging.getLogger(__name__)
__author__ = 'Samuel Gratzl'

app = Namespace(__name__)


def _to_site_url(site):
  import phovea_server.plugin

  proxy_defs = phovea_server.plugin.list('tdp_proxy')
  for p in proxy_defs:
    if p.id == site:
      headers = getattr(p, 'headers') if hasattr(p, 'headers') else dict()
      return p.url.format(**request.args.to_dict()), headers
  # none matching found
  return None, None


def _request_url(url, headers):
  import phovea_server.plugin
  import re

  handlers = phovea_server.plugin.list('tdp_proxy_handler')
  for handler in handlers:
    handles = getattr(handler, 'handles', '.*')
    if re.match(handles, url, re.I):
      # found matching handler instantiate
      _log.info('proxy request url: %s via handler %s', url, handler.id)
      return handler.load().factory(url, headers)

  # no handler found using requests module
  _log.info('proxy request url: %s', url)
  return requests.get(url, headers=headers)


@app.route('/<site>')
def get_details(site):
  url, headers = _to_site_url(site)
  if not url:
    abort(404)

  r = _request_url(url, headers=headers)
  _log.info('proxy response status code: %s', r.status_code)
  return Response(r.text, status=r.status_code, content_type=r.headers['content-type'])


def create():
  return app


if __name__ == '__main__':
  app.debug = True
  app.run(host='0.0.0.0')
