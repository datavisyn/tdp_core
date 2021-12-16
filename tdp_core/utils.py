from phovea_server.ns import abort
import logging


_log = logging.getLogger(__name__)


secure_replacements = ['where', 'and_where', 'agg_score', 'joins']  # has to be part of the computed replacements


def map_scores(scores, from_idtype, to_idtype):
  """
  maps the given scores from idtype to to idtype
  :param scores:
  :param from_idtype:
  :param to_idtype:
  :return: a mapped version of the scores
  """
  from phovea_server.dataset import get_mappingmanager

  if len(scores) == 0:
    return []

  manager = get_mappingmanager()
  if not manager.can_map(from_idtype, to_idtype):
    abort(400, 'score cannot be mapped to target')
  mapped_ids = manager(from_idtype, to_idtype, [r['id'] for r in scores])

  mapped_scores = []
  for score, mapped in zip(scores, mapped_ids):
    if not mapped:
      continue
    for target_id in mapped:
      clone = score.copy()
      clone['id'] = target_id
      mapped_scores.append(clone)
  return mapped_scores


def clean_query(query):
  if callable(query):
    return 'custom function'
  import re
  q = query.strip()
  q_clean = re.sub(r'(\s)+', ' ', q)
  return q_clean


def wait_for_redis_ready(db, timeout=5) -> bool:
  import time
  import redis

  _log.info('check if redis is ready')
  start_time = time.time()
  while timeout is None or time.time() - start_time < timeout:
    try:
      db.dbsize()
    except (redis.exceptions.BusyLoadingError, redis.exceptions.ConnectionError):
      _log.info('stall till redis is ready')
      time.sleep(0.5)
    else:
      # Return true if we managed to get a valid response
      return True
  # If we time out, return false
  return False
