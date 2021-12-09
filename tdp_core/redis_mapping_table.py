import logging
from itertools import islice
from .utils import wait_for_redis_ready

_log = logging.getLogger(__name__)


def _get_config():
  import phovea_server.config
  return phovea_server.config.view('tdp_core.mapping')


def create_db():
  import redis

  c = _get_config()

  # print c.hostname, c.port, c.db
  return redis.Redis(host=c.hostname, port=c.port, db=c.db, charset='utf-8', decode_responses=True, **c.extras)


class RedisMappingTable(object):
  def __init__(self, from_idtype, to_idtype):
    self.from_idtype = from_idtype
    self.to_idtype = to_idtype

  def __call__(self, ids):
    db = create_db()

    def map_impl(id):
      key = '{}2{}.{}'.format(self.from_idtype, self.to_idtype, id)
      v = ''
      if db.get(key) is not None:
        v = db.get(key)
      return v.split(';')

    return [map_impl(id) for id in ids]

  def search(self, query, max_results=None):
    """
    searches for matches in the names of the given idtype
    :param query:
    :param max_results
    :return:
    """
    db = create_db()
    query = ''.join(('[' + lower + upper + ']' for lower, upper in zip(query.upper(), query.lower())))
    prefix = '{}2{}.'.format(self.from_idtype, self.to_idtype)
    match = '{}*{}*'.format(prefix, query)
    keys = [k for k in islice(db.scan_iter(match=match), max_results)]
    values = db.mget(keys)
    return [dict(match=key[len(prefix):], to=value) for key, value in zip(keys, values)]


class CachedRedisMappingTable(object):
  def __init__(self, from_idtype, to_idtype, db, all_keys):
    self.from_idtype = from_idtype
    self.to_idtype = to_idtype
    self._cache = self._load_cache(db, all_keys)

  def _load_cache(self, db, all_keys):
    import fnmatch
    prefix = '{}2{}.'.format(self.from_idtype, self.to_idtype)
    match = prefix + '*'
    keys = [k for k in fnmatch.filter(all_keys, match)]
    values = db.mget(keys)
    return {key[len(prefix):]: value for key, value in zip(keys, values)}

  def __call__(self, ids):
    def map_impl(id):
      v = self._cache.get(id, '')
      return v.split(';')

    return [map_impl(id.decode('utf-8')) for id in ids]

  def search(self, query, max_results=None):
    """
    searches for matches in the names of the given idtype
    :param query:
    :param max_results
    :return:
    """
    query = query.lower()
    return [dict(match=key, to=self._cache[key]) for key in
            islice((k for k in list(self._cache.keys()) if query in k.lower()), max_results)]


def _discover_mappings():
  db = create_db()
  if not wait_for_redis_ready(db):
    return []
  mappings = db.get('mappings')
  _log.info('found %s', mappings)
  if not mappings:
    return
  mappings = [r for r in mappings.split(';') if r.strip()]
  cached = _get_config().bulk
  if cached:
    keys = list(db.keys())
  else:
    keys = None
  for key in mappings:
    parts = key.split('2')
    _log.info('loading redis mapping table from %s to %s', parts[0], parts[1])
    from_idtype = parts[0]
    to_idtype = parts[1]
    yield (CachedRedisMappingTable(from_idtype, to_idtype, db, keys) if cached else RedisMappingTable(from_idtype, to_idtype))


class RedisMappingProvider(object):
  def __init__(self):
    self._mappings = list(_discover_mappings())

  def __iter__(self):
    return iter(((f.from_idtype, f.to_idtype, f) for f in self._mappings))


def create():
  return RedisMappingProvider()
