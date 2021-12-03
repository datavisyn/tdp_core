import logging
from codecs import open

_log = logging.getLogger(__name__)


def _get_db(key):
  import redis
  import phovea_server.config

  c = phovea_server.config.view(key)

  return redis.Redis(host=c.hostname, port=c.port, db=c.db, charset='utf-8', decode_responses=True)


def _get_assigner_db():
  return _get_db('tdp_core.assigner')


def _get_mapping_db():
  return _get_db('tdp_core.mapping')


def remove_all_ids():
  db = _get_assigner_db()
  db.flushdb()


def remove_all_mappings():
  db = _get_mapping_db()
  db.flushdb()


def load_ids_from_file(idtype, file_name, set_max=True):
  db = _get_assigner_db()
  _log.info('loading ids for %s from %s', idtype, file_name)
  with open(file_name, 'r', encoding='utf-8') as f:
    max_uid = None
    for line in f:
      [id, uid] = line.split('\t')
      uid = int(uid)
      if max_uid is None or uid > max_uid:
        max_uid = uid
      key = '{}2id.{}'.format(idtype, id)
      db.set(key, uid)
      key = 'id2{}.{}'.format(idtype, uid)
      db.set(key, id)
  if set_max:
    db.set(idtype, max_uid + 1)


def load_mapping_from_file(from_idtype, to_idtype, file_name):
  db = _get_mapping_db()
  _log.info('loading mapping from %s -> %s from %s', from_idtype, to_idtype, file_name)

  db.append('mappings', '{}2{};'.format(from_idtype, to_idtype))
  with open(file_name, 'r', encoding='utf-8') as f:
    for line in f:
      s = line.split('\t')
      key = '{}2{}.{}'.format(from_idtype, to_idtype, s[0].strip())
      db.set(key, ';'.join(s[1:]).strip())
