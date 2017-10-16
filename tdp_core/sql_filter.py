import logging

_log = logging.getLogger(__name__)


def _replace_named_sets_in_ids(v):
  """
  replaces magic named sets references with their ids
  :param v:
  :return:
  """
  import storage
  import phovea_server.plugin

  manager = phovea_server.plugin.lookup('idmanager')

  union = set()

  def add_namedset(vi):
    # convert named sets to the primary ids
    namedset_id = vi
    namedset = storage.get_namedset_by_id(namedset_id)
    uids = namedset['ids']
    id_type = namedset['idType']
    ids = manager.unmap(uids, id_type)
    for id in ids:
      union.add(id)

  if isinstance(v, list):
    for vi in v:
      add_namedset(vi)
  else:
    add_namedset(v)
  return list(union)


def _replace_range_in_ids(v, id_type, target_id_type):
  from phovea_server.dataset import get_mappingmanager, get_idmanager
  from phovea_server.range import parse

  manager = get_idmanager()
  mappingmanager = get_mappingmanager()

  union = set()

  def add_range(r):
    # convert named sets to the primary ids
    uids = parse(r)[0].tolist()
    ids = manager.unmap(uids, id_type)
    if id_type != target_id_type:
      # need to map the ids
      mapped_ids = mappingmanager(id_type, target_id_type, ids)
      for id in mapped_ids:
        if id is not None and len(id) > 0:
          union.add(id[0])  # just the first one for now
    else:
      for id in ids:
        union.add(id)

  if isinstance(v, list):
    for vi in v:
      add_range(vi)
  else:
    add_range(v)
  return list(union)


def filter_logic(view, args):
  """
  parses the request arguments for filter
  :param view:
  :return:
  """
  processed_args = dict()
  extra_args = dict()
  where_clause = {}
  for k, v in args.lists():
    if k.endswith('[]'):
      k = k[:-2]
    if k.startswith('filter_'):
      where_clause[k[7:]] = v  # remove filter_
    else:
      processed_args[k] = v[0] if len(v) == 1 else v

  # handle special namedset4 filter types by resolve them and and the real ids as filter
  for k, v in where_clause.items():
    if k.startswith('namedset4'):
      del where_clause[k]  # delete value
      real_key = k[9:]  # remove the namedset4 part
      ids = _replace_named_sets_in_ids(v)
      if real_key not in where_clause:
        where_clause[real_key] = ids
      else:
        where_clause[real_key].extend(ids)
    if k.startswith('rangeOf'):
      del where_clause[k]  # delete value
      id_type_and_key = k[7:]
      id_type = id_type_and_key[:id_type_and_key.index('4')]
      real_key = id_type_and_key[id_type_and_key.index('4') + 1:]  # remove the range4 part
      ids = _replace_range_in_ids(v, id_type, view.idtype)
      if real_key not in where_clause:
        where_clause[real_key] = ids
      else:
        where_clause[real_key].extend(ids)

  def to_clause(k, v):
    l = len(v)
    kp = k.replace('.', '_')
    if l == 1:  # single value
      extra_args[kp] = v[0]
      operator = '='
    else:
      extra_args[kp] = tuple(v)
      operator = 'IN'
    # find the sub query to replace, can be injected for more complex filter operations based on the input
    sub_query = view.get_filter_subquery(k)
    return sub_query.format(operator=operator, value=':' + kp)

  for key in where_clause.keys():
    if not view.is_valid_filter(key):
      _log.warn('invalid filter key detected for view "%s" and key "%s"', view.query, key)
      del where_clause[key]

  where_default_clause = []
  where_group_clauses = {group: [] for group in view.filter_groups()}
  for k, v in where_clause.items():
    if len(v) <= 0:
      continue
    clause = to_clause(k, v)
    group = view.get_filter_group(k)
    join = view.get_filter_subjoin(k)
    if group is None:
      where_default_clause.append((clause, join))
    else:
      where_group_clauses[group].append((clause, join))

  replacements = dict()
  replacements['and_where'] = (' AND ' + ' AND '.join(c for c, _ in where_default_clause)) if where_default_clause else ''
  replacements['where'] = (' WHERE ' + ' AND '.join(c for c, _ in where_default_clause)) if where_default_clause else ''
  # unique joins
  replacements['joins'] = ' '.join(set(j for _, j in where_default_clause if j is not None))
  for group, v in where_group_clauses.items():
    replacements['and_' + group + '_where'] = (' AND ' + ' AND '.join(c for c, _ in v)) if v else ''
    replacements[group + '_where'] = (' WHERE ' + ' AND '.join(c for c, _ in v)) if v else ''
    replacements[group + '_joins'] = ' '.join(set(j for _, j in v if j is not None))

  return replacements, processed_args, extra_args, where_clause
