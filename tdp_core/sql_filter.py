import logging

from werkzeug.datastructures import MultiDict

_log = logging.getLogger(__name__)


def _replace_named_sets_in_ids(v):
    """
    replaces magic named sets references with their ids
    :param v:
    :return:
    """
    from . import storage

    union = set()

    def add_namedset(vi):
        # convert named sets to the primary ids
        namedset_id = vi
        namedset = storage.get_namedset_by_id(namedset_id)
        ids = namedset["ids"]
        for id in ids:
            union.add(id)

    if isinstance(v, list):
        for vi in v:
            add_namedset(vi)
    else:
        add_namedset(v)
    return list(union)


def filter_logic(view, args):
    """
    parses the request arguments for filter
    :param view:
    :return:
    """
    processed_args = MultiDict()
    extra_args = dict()
    where_clause = {}
    for k, v in list(args.lists()):
        if k.endswith("[]"):
            k = k[:-2]
        if k.startswith("filter_"):
            where_clause[k[7:]] = v  # remove filter_
        else:
            processed_args.setlist(k, v)

    # handle special namedset4 filter types by resolve them and and the real ids as filter
    for k, v in list(where_clause.items()):
        if k.startswith("namedset4"):
            del where_clause[k]  # delete value
            real_key = k[9:]  # remove the namedset4 part
            ids = _replace_named_sets_in_ids(v)
            if real_key not in where_clause:
                where_clause[real_key] = ids
            else:
                where_clause[real_key].extend(ids)
        if k.startswith("rangeOf"):
            del where_clause[k]  # delete value
            id_type_and_key = k[7:]
            real_key = id_type_and_key[id_type_and_key.index("4") + 1 :]  # remove the range4 part
            ids = v
            if real_key not in where_clause:
                where_clause[real_key] = ids
            else:
                where_clause[real_key].extend(ids)

    def to_clause(k, v):
        length = len(v)
        kp = k.replace(".", "_")
        if length == 1:  # single value
            operator = "="
            if kp.startswith("lt_"):
                # keep the 'lt_' for kp to distinguish from the others ('lte_', 'gt_', 'gte_') in the created sub_query
                k = k[3:]  # remove the 'lt_' to use the right column name in the created sub_query
                operator = "<"
            if kp.startswith("lte_"):
                # keep the 'lte_' for kp to distinguish from the others ('lt_', 'gt_', 'gte_') in the created sub_query
                k = k[4:]  # remove the 'lte_' to use the right column name in the created sub_query
                operator = "<="
            if kp.startswith("gt_"):
                # keep the 'gt_' for kp to distinguish from the others ('lt_', 'lte_' ,'gte_') in the created sub_query
                k = k[3:]  # remove the 'gt_' to use the right column name in the created sub_query
                operator = ">"
            if kp.startswith("gte_"):
                # keep the 'gte_' for kp to distinguish from the others ('lt_', 'lte_' ,'gt_') in the created sub_query
                k = k[4:]  # remove the 'gte_' to use the right column name in the created sub_query
                operator = ">="

            extra_args[kp] = v[0]
        else:
            # there are no 'lt', 'lte', 'gt', and 'gte' filters with multiple values, see about 10 code lines below
            extra_args[kp] = tuple(v)  # multi values need to be a tuple not a list
            operator = "IN"
        # find the sub query to replace, can be injected for more complex filter operations based on the input
        sub_query = view.get_filter_subquery(k)
        return sub_query.format(operator=operator, value=":" + kp)

    for key in list(where_clause.keys()):
        # key: is the attribute/column, but for greater and less filters it also includes one of the filter prefixes ('lt_', 'lte_', 'gt_', or 'gte_')
        original_key = key  # is a copy of key, to keep the possible greater ('gt_', 'gte_') or less ('lt_', 'lte_') filter prefix

        is_greater_less_filter = False
        check_complement_filter = False

        if key.startswith("lt_") or key.startswith("gt_"):
            key = key[
                3:
            ]  # remove the leading identifiers ('lt_' = less than, 'gt_' = greater than) for filter parameter check in `view.is_valid_filter(key):`
            is_greater_less_filter = True

        if key.startswith("lte_") or key.startswith("gte_"):
            key = key[
                4:
            ]  # remove the leading identifiers ('lte_' = less than equals, 'gte_' = greater than equals) for filter parameter check in `view.is_valid_filter(key):`
            is_greater_less_filter = True
            check_complement_filter = True

        # check if key (attribute/column) does exist in view
        if not view.is_valid_filter(key):
            _log.warn(
                'invalid filter key detected for view "%s" and key "%s"',
                view.query,
                key,
            )
            del where_clause[key]
            # raise RuntimeError('Invalid filter key detected, "' + original_key + '"')

        # check if column type is number for one of the greater ('gt' and 'gte') or less ('lt' and 'lte') filters
        column_type = view.columns.get(key, {}).get("type")
        if is_greater_less_filter and column_type != "number":
            raise RuntimeError(
                'Filters "lt","lte","gt", and "gte" are only applicable to columns of type "number", "' + key + '" is not of type "number".'
            )

        # check if a greater ('gt' or 'gte') or less ('lt' or 'lte') filter was used on the same column more than once
        if is_greater_less_filter and (len(where_clause[original_key]) > 1):
            separator = '", "'
            raise RuntimeError(
                'Filter "'
                + original_key
                + '" has too many values ("'
                + separator.join(where_clause[original_key])
                + '"), only one is allowed.'
            )

        # check complement filter for gte or lte ('gt' or 'lt' respectively)
        if check_complement_filter:
            complement_filter = original_key[:2] + "_" + key  # create complement filter
            complement_filter_exist = complement_filter in where_clause  # look if complement filter exist in the where clause
            # check if complement filter exists
            if complement_filter_exist:
                raise RuntimeError(
                    'Filter "'
                    + original_key
                    + '" has a complement filter "'
                    + complement_filter
                    + '", only one of these filters is allowed.'
                )

    where_default_clause = []
    where_group_clauses = {group: [] for group in view.filter_groups()}
    for k, v in list(where_clause.items()):
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
    replacements["and_where"] = (" AND " + " AND ".join(c for c, _ in where_default_clause)) if where_default_clause else ""
    replacements["where"] = (" WHERE " + " AND ".join(c for c, _ in where_default_clause)) if where_default_clause else ""
    # unique joins
    replacements["joins"] = " ".join(set(j for _, j in where_default_clause if j is not None))
    for group, v in list(where_group_clauses.items()):
        replacements["and_" + group + "_where"] = (" AND " + " AND ".join(c for c, _ in v)) if v else ""
        replacements[group + "_where"] = (" WHERE " + " AND ".join(c for c, _ in v)) if v else ""
        replacements[group + "_joins"] = " ".join(set(j for _, j in v if j is not None))

    return replacements, processed_args, extra_args, where_clause
