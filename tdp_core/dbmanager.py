import logging
from phovea_server.config import view as configview
from phovea_server.plugin import list as list_plugins

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)


class DBManager(object):
  def __init__(self):
    self._inited = False
    self._connectors = list_plugins('tdp-sql-database-definition')
    self._extensions = list_plugins('tdp-sql-database-extension')
    self._data = dict()

  def _load_connector(self, item):
    if not self._inited:
      self._inited = True
      for p in list_plugins('greenifier'):
        _log.info('run greenifier: %s', p.id)
        p.load().factory()
    if item in self._data:
      return self._data[item]

    p = next(p for p in self._connectors if p.id == item)
    config = configview(p.configKey)
    connector = p.load().factory()
    if not connector.dburl:
      connector.dburl = config['dburl']
    if not connector.statement_timeout:
      connector.statement_timeout = config.get('statement_timeout', default=None)
    if not connector.statement_timeout_query:
      connector.statement_timeout_query = config.get('statement_timeout_query', default=None)

    if not connector.dburl:
      _log.critical('no db url connector defined for %s at config key %s - is your configuration up to date?', p.id,
                    p.configKey)
      raise NotImplementedError('missing db connector url')

    _log.info('%s -> %s', p.id, connector.dburl)
    engine_options = config.get('engine', default={})
    import sqlalchemy
    engine = sqlalchemy.create_engine(connector.dburl, **engine_options)
    # Assuming that gevent monkey patched the builtin
    # threading library, we're likely good to use
    # SQLAlchemy's QueuePool, which is the default
    # pool class.  However, we need to make it use
    # threadlocal connections
    # https://github.com/kljensen/async-flask-sqlalchemy-example/blob/master/server.py
    engine.pool._use_threadlocal = True

    r = connector, engine
    self._data[item] = r
    return r

  def _load_extension(self, item):
    if item in self._data:
      return self._data[item]

    p = next(p for p in self._extensions if p.id == item)
    base = self.get(p.base)
    if not base:
      raise NotImplementedError('invalid database extension no base found: %s base: %s' % (p.id, p.base))

    base_connector, engine = base
    connector = p.load().factory()
    if not connector.statement_timeout:
      connector.statement_timeout = base_connector.statement_timeout
    if not connector.statement_timeout_query:
      connector.statement_timeout_query = base_connector.statement_timeout_query

    r = connector, engine
    self._data[item] = r
    return r

  def __getitem__(self, item):
    if item not in self:
      raise NotImplementedError('missing db connector: ' + item)
    if item in self._data:
      return self._data[item]
    if any(p.id == item for p in self._connectors):
      return self._load_connector(item)
    if any(p.id == item for p in self._extensions):
      return self._load_extension(item)
    raise NotImplementedError('missing db connector: ' + item)

  def __contains__(self, item):
    return item in self._data or \
           any(p.id == item for p in self._connectors) or \
           any(p.id == item for p in self._extensions)

  def get(self, item, default=None):
    if item not in self:
      return default
    return self[item]
