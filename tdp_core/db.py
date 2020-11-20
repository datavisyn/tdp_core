import logging
import phovea_server.config
from .sql_filter import filter_logic
from phovea_server.ns import abort
from .dbmanager import DBManager
from .utils import clean_query, secure_replacements
from werkzeug.datastructures import MultiDict

__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)
c = phovea_server.config.view('tdp_core')
configs = DBManager()


def _supports_sql_parameters(dialect):
  return dialect.lower() != 'sqlite' and dialect.lower() != 'oracle'  # sqlite doesn't support array parameters, postgres does


def _differentiates_empty_string_and_null(dialect):
  return dialect.lower() != 'oracle'  # for Oracle, an empty string is the same as a null string


def resolve(database):
  """
  finds and return the connector and engine for the given database
  :param database: database key to lookup
  :return: (connector, engine)
  """
  if database not in configs:
    abort(404, 'Database with id "{}" cannot be found'.format(database))
  r = configs[database]
  # derive needed columns
  connector, engine = r
  for view in connector.views.values():
    if view.needs_to_fill_up_columns() and view.table is not None:
      _fill_up_columns(view, engine)
  return r


def resolve_engine(database):
  """
  finds and return the engine for the given database
  :param database: database key to lookup
  :return: engine
  """
  if database not in configs:
    abort(404, 'Database with id "{}" cannot be found'.format(database))
  return configs.engine(database)


def resolve_view(database, view_name, check_default_security=False):
  """
  finds and return the connector, engine, and view for the given database and view_name
  :param database: database key to lookup
  :param view_name: view name to lookup
  :param check_default_security: bool; usually view.can_access returns True when no security is defined on the view. This parameter can be used to tell the method that it should check the security anyway, e.g. that the user is at least logged in
  :return: (connector, engine, view)
  """
  connector, engine = resolve(database)
  if view_name not in connector.views:
    abort(404, 'view with id "{}" cannot be found in database "{}"'.format(view_name, database))
  view = connector.views[view_name]
  # TODO: improve the logic of the view.can_access function, because even for unauthorized can_access returns True, i.e. that the user can access the resource. Somewhere else the server checks whether the user is authenticated or not
  if not view.can_access(check_default_security):
    abort(403)
  return connector, engine, view


def assign_ids(rows, idtype):
  """
  assigns unique ids (stored in '_id') based on the 'id' column and given idtype
  :param rows: the rows having an 'id' column each
  :param idtype: the idtype to resolve the id
  :return: the extended rows
  """
  import phovea_server.plugin

  manager = phovea_server.plugin.lookup('idmanager')
  for _id, row in zip(manager((r['id'] for r in rows), idtype), rows):
    row['_id'] = _id
  return rows


def to_query(q, supports_array_parameter, parameters):
  """
  converts to the native SQL query using sqlalchemy + handling of array parameters
  :param q: the SQL query
  :param supports_array_parameter: whether array parameters are supported
  :param parameters: dictionary of parameters that are going to be applied
  :return: the transformed query and call by reference updated parameters
  """
  import sqlalchemy

  q = q.replace('\n', ' ').replace('\r', ' ')
  if supports_array_parameter:
    return sqlalchemy.sql.text(q)

  # need to suffix all array parameter and wrap with ()
  for k, v in list(parameters.items()):
    if not isinstance(v, list) and not isinstance(v, tuple):
      continue
    # sounds like an array
    # convert from :ids to (:ids0, :ids1, :ids2)
    subparameters = {(k + str(i)): vi for i, vi in enumerate(v)}
    q = q.replace(':' + k, '({ids})'.format(ids=', '.join(':' + p for p in subparameters.keys())))
    del parameters[k]  # delete single
    parameters.update(subparameters)  # add sub

  return sqlalchemy.sql.text(q)


class WrappedSession(object):
  def __init__(self, engine):
    """
    session wrapper of sql alchemy with auto cleanup
    :param engine:
    """
    _log.info('creating session')
    self._session = configs.create_session(engine)
    self._supports_array_parameter = _supports_sql_parameters(engine.name)

  def execute(self, sql, **kwargs):
    """
    execute the given query with the given args
    :param sql: query
    :param kwargs: additional args to replace
    :return: the session result
    """
    import sqlalchemy
    parsed = to_query(sql, self._supports_array_parameter, kwargs)
    _log.info('%s (%s)', parsed, kwargs)
    try:
      return self._session.execute(parsed, kwargs)
    except sqlalchemy.exc.OperationalError as error:
      abort(408, error)

  def run(self, sql, **kwargs):
    """
    runs the given sql statement, in contrast to execute the result will be converted to a list of dicts
    :param sql: the sql query to execute
    :param kwargs: args for this query
    :return: list of dicts
    """
    result = self.execute(sql, **kwargs)
    columns = result.keys()
    return [{c: r[c] for c in columns} for r in result]

  def __call__(self, sql, **kwargs):
    return self.run(sql, **kwargs)

  def __enter__(self):
    return self

  def commit(self):
    self._session.commit()

  def flush(self):
    self._session.flush()

  def rollback(self):
    self._session.rollback()

  def _destroy(self):
    if self._session:
      _log.info('removing session again')
      self._session.close()
      self._session = None

  def __del__(self):
    self._destroy()

  def __exit__(self, exc_type, exc_val, exc_tb):
    self._destroy()


def session(engine):
  return WrappedSession(engine)


def get_columns(engine, table_name):
  """
  returns the set of columns (name, type: (string|categorical|number), categories: string[]) for the given table or view
  :param engine: underlying engine
  :param table_name: table name which may include a schema prefix
  :return: the list of columns
  """
  import sqlalchemy

  schema = None
  if '.' in table_name:
    splitted = table_name.split('.')
    schema = splitted[0]
    table_name = splitted[1]
  inspector = sqlalchemy.inspect(engine)

  columns = inspector.get_columns(table_name, schema)

  def _normalize_columns(col):
    from sqlalchemy import types
    r = dict(label=col['name'], type='string', column=col['name'])
    t = col['type']
    if isinstance(t, types.Integer) or isinstance(t, types.Numeric):
      r['type'] = 'number'
    elif isinstance(t, types.Enum):
      r['type'] = 'categorical'
      r['categories'] = sorted(t.enums, key=lambda s: s.lower())
    return r

  return map(_normalize_columns, columns)


def _handle_aggregated_score(base_view, config, replacements, args):
  """
  Handle aggregation for aggregated (and inverted aggregated) score queries
  :param replacements:
  :return replacements:
  """
  view = config.agg_score
  agg = args.get('agg', '')

  if agg == '':
    return replacements

  query = view.query

  # generic specific variant
  if agg in view.queries:
    query = view.queries[agg]

  # view specific variant
  if ('agg_score_' + agg) in base_view.queries:
    query = base_view.queries['agg_score_' + agg]

  if query is None:
    return replacements

  replace = {}
  if view.replacements is not None:
    for arg in view.replacements:
      replace[arg] = args.get(arg, '')

  replacements['agg_score'] = query.format(**replace)

  return replacements


def prepare_arguments(view, config, replacements=None, arguments=None, extra_sql_argument=None):
  """
  prepares for the given view the kwargs and replacements based on the given input
  :param view: db view
  :param config: db connector config
  :param replacements: dict of generated or resolved replacements
  :param arguments: dict of arguments or as fallback replacements
  :param extra_sql_argument: additional unchecked kwargs
  :return: (kwargs, replace)
  """
  replacements = replacements or {}
  arguments = arguments or {}
  replacements = _handle_aggregated_score(view, config, replacements, arguments)

  # convert to index lookup
  kwargs = {}
  replace = {}

  if view.arguments is not None:
    for arg in view.arguments:
      info = view.get_argument_info(arg)
      lookup_key = arg

      if lookup_key not in arguments:
        if (arg + '[]') in arguments:  # check if we can find the lookup key with array form
          lookup_key = (arg + '[]')
        elif not info or not info.list_as_tuple:
          _log.warn('missing argument "%s": "%s"', view.query, arg)
          abort(400, 'missing argument: ' + arg)
      parser = info.type if info and info.type is not None else lambda x: x
      try:
        if info and info.as_list:
          vs = arguments.getlist(lookup_key) if hasattr(arguments, 'getlist') else arguments.get(lookup_key)
          value = tuple([parser(v) for v in vs])  # multi values need to be a tuple not a list
        elif info and info.list_as_tuple:
          vs = arguments.getlist(lookup_key) if hasattr(arguments, 'getlist') else arguments.get(lookup_key, [])
          if len(vs) == 0:
            value = "(1, null)"
          else:
            if(str(vs[0]).isdigit() and (info.type is None or info.type == int)):
              value = '(1,%s)' % '),(1,'.join(vs)
            else:
              value = '(1,\'%s\')' % '\'),(1,\''.join(vs)
          if(view.query):
            # HACK: this hack allows us to inject arguments (DBViewBuilder.args) into the query (like the replacements) but at the same time use the list_as_tuple option
            # We'll replace the query's argument with a placeholder, which is then used as a replacement, i.e. replaced via str.format(...)
            magic_placeholder = "magic_list_as_tuple_replacement"
            replace[magic_placeholder] = value
            view.query = view.query.replace(":" + lookup_key, "{" + magic_placeholder + "}")
          else:
            kwargs[arg] = value
          continue
        else:
          value = parser(arguments.get(lookup_key))
        kwargs[arg] = value
      except ValueError as verr:
        abort(400, 'invalid argument for: ' + arg + ' - ' + str(verr))

  if extra_sql_argument is not None:
    kwargs.update(extra_sql_argument)

  if view.replacements is not None:
    for arg in view.replacements:
      fallback = arguments.get(arg, '')
      if arg in secure_replacements:  # has to be part of the replacements
        value = replacements.get(arg, '')
      else:
        value = replacements.get(arg, fallback)  # if not a secure one fallback with an argument
      if not view.is_valid_replacement(arg, value):
        _log.warn('invalid replacement value detected "%s": "%s"="%s"', view.query, arg, value)
        abort(400, 'the given parameter "%s" is invalid' % arg)
      else:
        replace[arg] = value

  return kwargs, replace


def get_data(database, view_name, replacements=None, arguments=None, extra_sql_argument=None, filters=None):
  """
  executes the given view name on the given database with the given arguments
  :param database: db connector name
  :param view_name: view name
  :param replacements: dict of replacements
  :param arguments: dict of arguments
  :param extra_sql_argument: additional unchecked kwargs for the query
  :param filters: the dict of dynamically build filter
  :return: (r, view) tuple of the resulting rows and the resolved view
  """
  config, engine, view = resolve_view(database, view_name)

  kwargs, replace = prepare_arguments(view, config, replacements, arguments, extra_sql_argument)

  query = view.query

  if callable(query):
    # callback variant
    return query(engine, arguments, filters), view

  with session(engine) as sess:
    if config.statement_timeout is not None:
      _log.info('set statement_timeout to {}'.format(config.statement_timeout))
      sess.execute(config.statement_timeout_query.format(config.statement_timeout))
    r = sess.run(query.format(**replace), **kwargs)
  return r, view


def get_query(database, view_name, replacements=None, arguments=None, extra_sql_argument=None):
  config, engine, view = resolve_view(database, view_name)

  kwargs, replace = prepare_arguments(view, config, replacements, arguments, extra_sql_argument)

  query = view.query

  if callable(query):
    return dict(query='custom function', args=kwargs)

  return dict(query=clean_query(query.format(**replace)), args=kwargs)


def get_filtered_data(database, view_name, args):
  config, _, view = resolve_view(database, view_name)
  # convert to index lookup
  # row id start with 1
  try:
    replacements, processed_args, extra_args, where_clause = filter_logic(view, args)
  except RuntimeError as error:
    abort(400, error)

  return get_data(database, view_name, replacements, processed_args, extra_args, where_clause)


def get_filtered_query(database, view_name, args):
  config, _, view = resolve_view(database, view_name)
  # convert to index lookup
  # row id start with 1
  try:
    replacements, processed_args, extra_args, where_clause = filter_logic(view, args)
  except RuntimeError as error:
    abort(400, error)

  return get_query(database, view_name, replacements, processed_args, extra_args)


def _get_count(database, view_name, args):
  config, engine, view = resolve_view(database, view_name)

  try:
    replacements, processed_args, extra_args, where_clause = filter_logic(view, args)
  except RuntimeError as error:
    abort(400, error)

  kwargs, replace = prepare_arguments(view, config, replacements, processed_args, extra_args)

  if 'count' in view.queries:
    count_query = view.queries['count']
  elif view.table:
    count_query = 'SELECT count(d.*) as count FROM {table} d {{joins}} {{where}}'.format(table=view.table)
  else:
    count_query = None
    abort(500, 'invalid view configuration, missing count query and cannot derive it')

  return config, engine, count_query, processed_args, where_clause, replace, kwargs


def get_count(database, view_name, args):
  """
  similar to get_data but returns the count of resulting rows
  :param database: db connector name
  :param view_name: view name
  :return: the count of results
  """

  config, engine, count_query, processed_args, where_clause, replace, kwargs = _get_count(database, view_name, args)

  if callable(count_query):
    # callback variant
    return count_query(engine, processed_args, where_clause)

  with session(engine) as sess:
    if config.statement_timeout is not None:
      _log.info('set statement_timeout to {}'.format(config.statement_timeout))
      sess.execute(config.statement_timeout_query.format(config.statement_timeout))
    r = sess.run(count_query.format(**replace), **kwargs)
  if r:
    return r[0]['count']
  return 0


def get_count_query(database, view_name, args):
  config, engine, count_query, processed_args, where_clause, replace, kwargs = _get_count(database, view_name, args)

  if callable(count_query):
    return dict(query='custom function', args=kwargs)

  return dict(query=count_query.format(**replace), args=kwargs)


def derive_columns(table_name, engine, columns=None):
  """
  helper function to derive the columns of a table
  """
  columns = columns or {}

  for col in get_columns(engine, table_name):
    name = col['column']
    if name in columns:
      # merge
      old = columns[name]
      for k, v in col.items():
        if k not in old:
          old[k] = v
    else:
      columns[name] = col

  # derive the missing domains and categories
  number_columns = [k for k, col in columns.items() if
                    col['type'] == 'number' and ('min' not in col or 'max' not in col)]
  categorical_columns = [k for k, col in columns.items() if (col['type'] == 'categorical' or col['type'] == 'set') and 'categories' not in col]
  if number_columns or categorical_columns:
    with session(engine) as s:
      if number_columns:
        template = 'min({col}) as {col}_min, max({col}) as {col}_max'
        minmax = ', '.join(template.format(col=col) for col in number_columns)
        row = next(iter(s.execute("""SELECT {minmax} FROM {table}""".format(table=table_name, minmax=minmax))))
        for num_col in number_columns:
          columns[num_col]['min'] = row[num_col + '_min']
          columns[num_col]['max'] = row[num_col + '_max']
      for col in categorical_columns:
        template = """SELECT distinct {col} as cat FROM {table} WHERE {col} is not NULL"""
        if _differentiates_empty_string_and_null(engine.name):
          template += """ AND {col} <> ''"""
        template += """ ORDER BY {col} ASC"""
        cats = s.execute(template.format(col=col, table=table_name))
        categories = [str(r['cat']) for r in cats if r['cat'] is not None]
        if columns[col]['type'] == 'set':
            separator = getattr(columns[col], 'separator', ';')
            separated_categories = [category.split(separator) for category in categories]
            # flatten array
            categories = list(set([category for sublist in separated_categories for category in sublist]))
            categories.sort()  # sort list to avoid random order with each run
        columns[col]['categories'] = categories

  return columns


def _fill_up_columns(view, engine):
  _log.info('fill up view')
  # update the real object
  view.columns = derive_columns(view.table, engine, view.columns)
  view.columns_filled_up = True


def _lookup(database, view_name, query, page, limit, args):
  config, engine, view = resolve_view(database, view_name)

  arguments = MultiDict(args)
  offset = page * limit
  # replace with wildcard version
  arguments['query'] = '%{}%'.format(query)
  arguments['query_end'] = '%{}'.format(query)
  arguments['query_start'] = '{}%'.format(query)
  arguments['query_match'] = '{}'.format(query)
  # add 1 for checking if we have more
  replacements = dict(limit=limit + 1, offset=offset, offset2=(offset + limit + 1))

  kwargs, replace = prepare_arguments(view, config, replacements, arguments)

  return engine, view, view.query, replace, kwargs


def lookup_query(database, view_name, query, page, limit, args):
  engine, _, sql, replace, kwargs = _lookup(database, view_name, query, page, limit, args)

  if callable(sql):
    return dict(query='custom function', args=kwargs)

  return dict(query=sql.format(**replace), args=kwargs)


def lookup(database, view_name, query, page, limit, args):
  engine, view, sql, replace, kwargs = _lookup(database, view_name, query, page, limit, args)

  if callable(sql):
    kwargs.update(replace)
    # callback variant
    return sql(engine, kwargs, None)

  with session(engine) as sess:
    r_items = sess.run(sql.format(**replace), **kwargs)

  more = len(r_items) > limit
  if more:
    # hit the boundary of more remove the artificial one
    del r_items[-1]

  return r_items, more, view
