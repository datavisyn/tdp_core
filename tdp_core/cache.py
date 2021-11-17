import logging
from .utils import wait_for_redis_ready

_log = logging.getLogger(__name__)


class RedisCache(object):
  """
  assigns ids to object using a redis database
  """

  def __init__(self):
    import redis
    import phovea_server.config

    c = phovea_server.config.view('tdp_core.cache')

    # print c.hostname, c.port, c.db
    self._db = redis.Redis(host=c.hostname, port=c.port, db=c.db, charset='utf-8', decode_responses=True, **c.extras)
    wait_for_redis_ready(self._db)
    self._default_timeout = c.timeout

  def get(self, key):
    return self._db.get(key)

  def set(self, key, value, timeout=None):
    self._db.set(key, value)
    if timeout is None:
      timeout = self._default_timeout
    if timeout > 0:
      self._db.expire(key, timeout)


def create():
  _log.info('create redis cache')
  return RedisCache()
