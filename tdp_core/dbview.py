import logging
import re
from collections import OrderedDict
from typing import Any

import sqlalchemy
from opentelemetry import trace
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker
from visyn_core.security import current_user, is_logged_in

from .utils import clean_query

tracer = trace.get_tracer(__name__)
_log = logging.getLogger(__name__)
REGEX_TYPE = type(re.compile(""))


class ArgumentInfo:
    def __init__(
        self,
        type=None,
        description="",
        example=None,
        as_list=False,
        is_id=None,
        list_as_tuple=False,
    ):
        self.type = type
        self.description = description
        self.example = example
        self.as_list = as_list
        self.is_id = is_id
        self.list_as_tuple = list_as_tuple


class DBFilterData:
    def __init__(self, group, sub_query, join):
        self.group = group
        self.sub_query = sub_query
        self.join = join


class DBView:
    def __init__(self, idtype=None, query=None):
        self.description = ""
        self.summary = ""
        self.query_type = "generic"
        self.tags = []
        self.idtype = idtype
        self.query = query
        self.queries = {}
        self.columns = OrderedDict()
        self.columns_filled_up = False
        self.replacements = []
        self.valid_replacements = {}
        self.arguments = []
        self.argument_infos = {}
        self.filters = {}
        self.table = None
        self.security = None
        self.no_cache = False

    def needs_to_fill_up_columns(self):
        return self.columns_filled_up is False and self.table is not None

    def dump(self, name):
        from collections import OrderedDict

        r: OrderedDict[str, Any] = OrderedDict(name=name, description=self.description, type=self.query_type)
        r["idType"] = self.idtype
        r["query"] = clean_query(self.query)
        args = list(self.arguments)
        args.extend(self.replacements)
        r["arguments"] = args
        r["columns"] = list(self.columns.values()) if self.columns else []  # some views have no columns -> return empty array
        if self.filters:
            r["filters"] = list(self.filters.keys())
        if self.queries:
            r["queries"] = {k: clean_query(v) for k, v in self.queries.items()}
        r["no_cache"] = self.no_cache
        return r

    def is_valid_filter(self, key):
        if key in self.filters:
            return True
        if key in self.columns:
            return True
        # if not specified and not the columns completed
        return not self.filters and not self.columns_filled_up

    def get_filter_subquery(self, key):
        if key in self.filters and self.filters[key].sub_query is not None:
            return self.filters[key].sub_query
        if ("filter_" + key) in self.queries:  # compatibility
            return self.queries["filter_" + key]
        return key + " {operator} {value}"

    def get_filter_group(self, key):
        if key in self.filters:
            return self.filters[key].group
        return None

    def get_filter_subjoin(self, key):
        if key in self.filters:
            return self.filters[key].join
        return None

    def filter_groups(self):
        r = {v.group for v in list(self.filters.values())}
        if None in r:
            r.remove(None)
        return r

    def is_valid_replacement(self, key, value):
        if key not in self.replacements:
            return False
        if key not in self.valid_replacements:
            return True
        v = self.valid_replacements[key]
        if isinstance(v, list):
            return value in v
        if v == int:
            try:
                int(value)  # try to cast value to int
                return True  # successful type cast
            except ValueError:
                return False
        if v == float:
            try:
                float(value)  # try to cast value to float
                return True  # successful type cast
            except ValueError:
                return False
        if isinstance(v, REGEX_TYPE):
            return v.match(value)
        _log.info("unknown %s %s %s", key, value, v)
        return True

    def is_valid_argument(self, key):
        return key in self.arguments

    def get_argument_info(self, key):
        return self.argument_infos.get(key)

    # TODO: improve the logic of this function, because even for unauthorized can_access returns True, i.e. that the user can access the resource. Somewhere else the server checks whether the user is authenticated or not
    def can_access(self, check_default_security=False):
        """
        check whether a user can access a DBView (DBView.security is checked and can either be a boolean, a string (=group the user must belong to) or a function) or not.
        :param check_default_security: bool (default = False); True if the security should be checked by default, e.g. although self.security is None, otherwise the function will return True
        :return: bool
        """
        if self.security is None and check_default_security is False:
            return True
        if isinstance(self.security, str):
            role = str(self.security)
            return current_user().has_role(role)
        if callable(self.security):
            return self.security(current_user())
        if (
            isinstance(self.security, bool) and self.security is False
        ):  # check if security is a boolean and if it's disabled, i.e. it's value is False
            return True  # return that we're allowed to access the view, because its security is disabled
        return is_logged_in()  # because security is not disabled check if the user is at least logged in


class DBViewBuilder:
    """
    db view builder pattern implementation
    """

    def __init__(self, query_type="generic", tags=None):
        """
        :param query_type:
        """
        self.v = DBView()
        self.v.query_type = query_type
        self.v.tags = tags or []

    def clone(self, view):
        """
        initializes based on a given view
        :param view: the view to copy from
        :return: self
        """
        self.v.query_type = view.query_type
        self.v.idtype = view.idtype
        self.v.description = view.description
        self.v.summary = view.summary
        self.v.query = view.query
        self.v.queries = view.queries.copy()
        self.v.columns = view.columns.copy()
        self.v.replacements = list(view.replacements)
        self.v.arguments = list(view.arguments)
        self.v.argument_infos = view.argument_infos.copy()
        self.v.filters = view.filters.copy()
        self.v.valid_replacements = view.valid_replacements.copy()
        self.v.security = view.security
        self.v.no_cache = view.no_cache
        return self

    def description(self, desc, summary=None):
        """
        optional description of this query
        :param desc: the description text
        :param summary: optional shorter summary text
        :return: self
        """
        self.v.description = desc
        self.v.summary = summary or (desc if len(desc) < 20 else desc[0:20] + "...")
        return self

    def idtype(self, idtype):
        """
        specify the IDType of which the resulting rows are
        :param idtype: the idtype
        :return: self
        """
        self.v.idtype = idtype
        return self

    def table(self, table):
        """
        sets the base table name of this query e.g. for generating queries
        :param table: the table name
        :return: self
        """
        self.v.table = table
        return self

    def query(self, key, query=None):
        """
        sets or adds another query to this builder
        :param key: optional the key of this query if not given the default query will be set
        :param query: the sql query
        :return: self
        """
        if query is None:
            query = key
            self.v.query = query
        else:
            self.v.queries[key] = query
        return self

    def callback(self, key, callback=None):
        """
        instead of setting an SQL query setting a callback function that returns the result similar to executing the SQL query
        :param key: optional key
        :param callback: (engine: SQLAlchemyEngine, arguments: dict of query arguments, filters: dict of filters) => array of dicts
        :return:
        """
        if callback is None:
            callback = key
            self.v.query = callback
        else:
            self.v.queries[key] = callback
        return self

    def filters(self, keys, alias=None, table=None, group=None, join=None):
        """
        specify possible filter keys
        :param keys: the list of possible filters
        :param alias: shortcut for just specifying the left hand alias: {alias} {operator} {value}
        :param table: shortcut for just specifying the table alias: {table}.{key} {operator} {value}
        :param group: to inject the filter in another group and_group_where
        :param join: additional join to inject
        :return:
        """
        for key in list(keys):
            self.filter(key, alias=alias, table=table, group=group, join=join)
        return self

    def filter(self, key, replacement=None, alias=None, table=None, group=None, join=None):
        """
        add a possible filter with replacement strategy of type {key} {operator} {value}
        :param key: filter key
        :param replacement: optional the full replacement string has to inclue {operator} and {value}
        :param alias: shortcut for just specifying the left hand alias: {alias} {operator} {value}
        :param table: shortcut for just specifying the table alias: {table}.{key} {operator} {value}
        :param group: to inject the filter in another group and_group_where
        :param join: additional join to inject
        :return: self
        """
        if table is not None:
            alias = "{}.{}".format(table, key)
        if alias is not None:
            replacement = alias + " {operator} {value}"
        self.v.filters[key] = DBFilterData(group, replacement, join)
        return self

    def append(self, key, query=None):
        """
        append something to the query
        :param key: optional key
        :param query: the subpart to append
        :return: self
        """
        if query is None:
            query = key
            self.v.query += query
        else:
            self.v.queries[key] += query
        return self

    def query_stats(self, query):
        """
        shortcut for query('stats', query)
        :param query: the query
        :return: self
        """
        self.v.queries["stats"] = query
        return self

    def query_categories(self, query):
        """
        shortcut for query('categories', query)
        :param query: the query
        :return: self
        """
        self.v.queries["categories"] = query
        return self

    def derive_columns(self):
        """
        specify that the columns should be automatically derived, requires that 'table' is given
        :return: self
        """
        self.v.columns_filled_up = False
        return self

    def column(self, name, **kwargs):
        """
        specify a column along with a type for the result
        :param name: name of column
        :param kwargs: additional attributes such as label and type
        :return: self
        """
        if "label" not in kwargs:
            kwargs["label"] = name
        kwargs["column"] = name
        self.v.columns[name] = kwargs
        return self

    def replace(self, replace, valid_replacements=None):
        """
        specify to replace a certain piece of the query (using {replace}) within the query
        :param replace: the key to replace
        :param valid_replacements: optional validation to avoid SQL injection, possible values: a list of strings, a regex, int or float
        :return: self
        """
        self.v.replacements.append(replace)
        if valid_replacements is not None:
            self.v.valid_replacements[replace] = valid_replacements
        return self

    def arg(
        self,
        arg,
        type=None,
        description="",
        example=None,
        as_list=False,
        is_id=None,
        list_as_tuple=False,
    ):
        """
        adds another argument of this query (using :arg) which will be replaced within SQL
        :param arg: the argument key
        :param type: optional type of the argument, like int or float
        :param description: optional argument description
        :param example: optional argument example
        :param as_list: optional whether the argument has to be a list
        :param is_id: optional whether the argument is an id argument, the value is the idtype required
        :param list_as_tuple: optional whether the argument is a list but should be submitted as tuple (f.e. in oracle; especially for IN statements); use the key with ':' in the query
        :return: self
        """
        self.v.arguments.append(arg)
        self.v.argument_infos[arg] = ArgumentInfo(type, description, example, as_list, is_id, list_as_tuple)
        return self

    def call(self, f=None):
        """
        shortcut for f(self)
        :param f: the function to call
        :return: self
        """
        if f is not None:
            f(self)
        return self

    def security(self, security_check):
        """
        adds a security check for this view
        :param security_check: either a string = role_name or a function that will get the user as first argument
        :return: self
        """
        self.v.security = security_check
        return self

    def no_cache(self):
        """
        adds a no-cache header to the response to avoid client caching of the response
        """
        self.v.no_cache = True
        return self

    def build(self):
        """
        builds the query and end this builder
        :return: the built query
        """
        return self.v


def limit_offset(builder):
    """
    helper function to append the limit and offset suffix
    :param builder: the current query builder
    :return:
    """
    return builder.append(" LIMIT {limit} OFFSET {offset}").replace("limit", int).replace("offset", int).arg("query")


def inject_where_clause(builder, clause):
    """
    helper function to inject an additional where clause
    :param builder: the current builder
    :param clause: the clause to inject
    :return:
    """
    query = builder.v.query
    if callable(query):
        return builder
    lower = query.lower()
    index = lower.find(" where ")
    if index >= 0:
        index += len(" where ")  # get the end
        builder.query("{} ({}) AND {}".format(query[:index], clause, query[index:]))
    else:
        before = -1
        for before_q in [" order by", " group by", " limit", " offset"]:
            before = lower.find(before_q)
            if before >= 0:
                break
        if before < 0:
            # append
            builder.append(" WHERE ").append(clause)
        else:
            builder.query("{} WHERE {} {}".format(query[:index], clause, query[index:]))
    return builder


def inject_where(builder):
    """
    helper function to append to the query the generated where clause
    :param builder: the current builder
    :return:
    """
    query = builder.v.query
    if callable(query):
        return builder
    lower = query.lower()
    where = lower.find(" where ")
    before = -1
    for before_q in [" group by", " order by", " limit", " offset"]:
        before = lower.find(before_q)
        if before >= 0:
            break

    if where >= 0:
        if before < 0:
            builder.append(" {and_where}")
        else:
            builder.query("{} {{and_where}} {}".format(query[:before], query[before:]))
        builder.replace("and_where")
        query = builder.v.query
        builder.query("{} {{joins}} {}".format(query[:where], query[where:]))
        builder.replace("joins")
    else:
        if before < 0:
            builder.append("{joins} {where}")
        else:
            builder.query("{} {{joins}} {{where}} {}".format(query[:before], query[before:]))
        builder.replace("where")
        builder.replace("joins")
    return builder


def add_common_queries(
    queries,
    table,
    idtype,
    id_query,
    columns=None,
    call_function=None,
    prefix=None,
    name_column="name",
):
    """
    create a set of common queries
    :param queries: dict where the queries should be stored
    :param table: base table name
    :param idtype: idtype of the table
    :param id_query: the snippet to create the required 'id' column
    :param columns: a list of columns for validation
    :param call_function: another call function
    :param prefix: optional prefix instead of the table name
    :param name_column: name of the name column used to verify items
    :return: None
    """
    if prefix is None:
        prefix = table

    queries[prefix + "_items"] = (
        DBViewBuilder("lookup")
        .idtype(idtype)
        .table(table)
        .query(
            """
        SELECT {id}, {{column}} AS text
        FROM {table} WHERE LOWER({{column}}) LIKE :query
        ORDER BY {{column}} ASC""".format(
                id=id_query, table=table
            )
        )
        .replace("column", columns)
        .call(call_function)
        .call(limit_offset)
        .arg("query")
        .build()
    )

    queries[prefix + "_items_verify"] = (
        DBViewBuilder("helper")
        .idtype(idtype)
        .table(table)
        .query(
            """
        SELECT {id}, {name} AS text
        FROM {table}""".format(
                id=id_query, table=table, name=name_column
            )
        )
        .call(call_function)
        .call(inject_where)
        .filter(name_column, "lower({name}) {{operator}} {{value}}".format(name=name_column))
        .build()
    )

    queries[prefix + "_unique"] = (
        DBViewBuilder("lookup")
        .query(
            """
        SELECT d as id, d as text
        FROM (
          SELECT distinct {{column}} AS d
          FROM {table} WHERE LOWER({{column}}) LIKE :query
          ) as t
        ORDER BY d ASC""".format(
                table=table
            )
        )
        .replace("column", columns)
        .call(limit_offset)
        .arg("query")
        .build()
    )

    queries[prefix + "_unique_all"] = (
        DBViewBuilder("helper")
        .query(
            """
        SELECT distinct {{column}} AS text
        FROM {table} ORDER BY {{column}} ASC """.format(
                table=table
            )
        )
        .replace("column", columns)
        .build()
    )


"""
 default aggregation
"""
default_agg_score = DBViewBuilder().query("{agg}({data_subtype})").replace("agg", ["min", "max", "avg"]).replace("data_subtype").build()


class DBMapping:
    """
    simple mapping based on a query of the form `select from_id as f, to_id as t from mapping_table where f in :ids`
    """

    def __init__(self, from_idtype, to_idtype, query, integer_ids=False):
        self.from_idtype = from_idtype
        self.to_idtype = to_idtype
        self.query = query
        self.integer_ids = integer_ids


class DBConnector:
    """
    basic connector object
    """

    def __init__(self, views=None, agg_score=None, mappings=None):
        """
        :param views: the dict of query views
        :param agg_score: optional specify how aggregation should be handled
        :param mappings: optional database mappings
        """
        with tracer.start_as_current_span("DBConnector.init"):
            _log.debug("create db connector")
            self.agg_score = agg_score or default_agg_score
            self.views = views or {}
            self.dburl: str = None  # type: ignore
            self.mappings = mappings
            self.statement_timeout = None
            self.statement_timeout_query: str | None = None
            self.description = ""

    def dump(self, name):
        return OrderedDict(name=name, description=self.description)

    def create_engine(self, config) -> Engine:
        import importlib

        poolclass_name = config.get("poolclass", "QueuePool")  # set to SQLAlchemy default poolclass = QueuePool
        try:
            poolclass = getattr(importlib.import_module("sqlalchemy.pool"), poolclass_name)
        except AttributeError:
            _log.warning("db connector: poolclass %s not found, using default QueuePool", poolclass_name)
            poolclass = sqlalchemy.pool.QueuePool

        _log.info("db connector: using poolclass %s", poolclass)

        # Set some default engine options for QueuePool to be backwards compatible with previous tdp_core code
        engine_options = (
            {"pool_size": 30, "pool_pre_ping": True} if poolclass_name == "QueuePool" or poolclass == sqlalchemy.pool.QueuePool else {}
        )

        engine_options.update(config.get("engine", {}))
        _log.debug("db connector: create engine with options %s", engine_options)

        with tracer.start_as_current_span("DBConnector.create_engine"):
            return sqlalchemy.create_engine(self.dburl, poolclass=poolclass, **engine_options)

    def create_sessionmaker(self, engine) -> sessionmaker:
        with tracer.start_as_current_span("DBConnector.create_sessionmaker"):
            _log.debug("db connector: create_sessionmaker")
            return sessionmaker(bind=engine)
