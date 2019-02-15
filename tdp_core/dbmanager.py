import logging

from phovea_server.config import view as configview
from phovea_server.plugin import list as list_plugins

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)


class DBManager(object):
  def __init__(self):
    self._initialized = False

    self.connectors = {}
    self._plugins = {}
    self._engines = dict()
    self._sessionmakers = dict()

    for p in list_plugins('tdp-sql-database-definition'):
      config = configview(p.configKey)
      connector = p.load().factory()
      if not connector.dburl:
        connector.dburl = config['dburl']
      if not connector.statement_timeout:
        connector.statement_timeout = config.get('statement_timeout', default=None)
      if not connector.statement_timeout_query:
        connector.statement_timeout_query = config.get('statement_timeout_query', default=None)
      if not connector.dburl:
        _log.critical('no db url defined for %s at config key %s - is your configuration up to date?', p.id,
                      p.configKey)
        continue

      self._plugins[p.id] = p
      self.connectors[p.id] = connector

    for p in list_plugins('tdp-sql-database-extension'):
      base_connector = self.connectors.get(p.base)
      if not base_connector:
        _log.critical('invalid database extension no base found: %s base: %s' % (p.id, p.base))
        continue
      connector = p.load().factory()
      if not connector.statement_timeout:
        connector.statement_timeout = base_connector.statement_timeout
      if not connector.statement_timeout_query:
        connector.statement_timeout_query = base_connector.statement_timeout_query

      self._plugins[p.id] = p
      self.connectors[p.id] = connector

  def _load_engine(self, item):
    if not self._initialized:
      self._initialized = True
      for p in list_plugins('greenifier'):
        _log.info('run greenifier: %s', p.id)
        p.load().factory()
    if item in self._engines:
      return self._engines[item]

    p = self._plugins[item]
    if p.type == 'tdp-sql-database-extension':
      engine = self._load_engine(p.base)
      self._engines[item] = engine
      return engine

    connector = self.connectors[item]
    # _log.info('%s -> %s', p.id, connector.dburl)
    config = configview(p.configKey)

    engine = connector.create_engine(config)
    maker = connector.create_sessionmaker(engine)

    self._engines[item] = engine
    self._sessionmakers[engine] = maker

    return engine

  def __getitem__(self, item):
    if item not in self:
      raise NotImplementedError('missing db connector: ' + item)
    return self.connectors[item], self._load_engine(item)

  def connector(self, item):
    if item not in self:
      raise NotImplementedError('missing db connector: ' + item)
    return self.connectors[item]

  def engine(self, item):
    if item not in self:
      raise NotImplementedError('missing db connector: ' + item)
    return self._load_engine(item)

  def create_session(self, engine):
    return self._sessionmakers[engine]()

  def create_web_session(self, engine):
    """
    create a session that is scoped by the current flask request.
    Note: if an exception occurs in the debug mode, flask for debugging reason won't destroy it
    """
    from flask import after_this_request

    session = self.create_session(engine)

    _log.info('create web session')

    @after_this_request
    def close_db(response_or_exc):
      _log.info('remove web session')
      session.close()
      return response_or_exc

    return session

  def __contains__(self, item):
    return item in self.connectors

  def get(self, item, default=None):
    if item not in self:
      return default
    return self[item]
