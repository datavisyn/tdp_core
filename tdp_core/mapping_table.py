import itertools
import logging

from visyn_core import manager

from . import db
from .dbview import DBMapping

_log = logging.getLogger(__name__)


class SQLMappingTable:
    def __init__(self, mapping: DBMapping, engine):
        self.from_idtype = mapping.from_idtype
        self.to_idtype = mapping.to_idtype
        self._engine = engine
        self._query = mapping.query
        self._integer_ids = mapping.integer_ids
        # Enable batch mapping operations by ensuring the correct return order
        self.preserves_order = True

    def __call__(self, ids):
        # ensure strings

        if self._integer_ids:  # convert to integer ids
            ids = [int(i) for i in ids]

        with db.session(self._engine) as session:
            mapped = session.execute(self._query, ids=ids)

            # handle multi mappings
            data = sorted(mapped, key=lambda x: x["f"])  # type: ignore
            grouped = {k: [r["t"] for r in g] for k, g in itertools.groupby(data, lambda x: x["f"])}
            # Return according to the given ids to ensure that we are preserving the order correctly
            return [grouped.get(id, []) for id in ids]


def _discover_mappings():
    for k, connector in manager.db.connectors.items():
        if not connector.mappings:
            continue
        engine = manager.db.engine(k)
        for mapping in connector.mappings:
            _log.info("registering %s to %s", mapping.from_idtype, mapping.to_idtype)
            yield SQLMappingTable(mapping, engine)


class SQLMappingProvider:
    def __init__(self):
        self._mappings = list(_discover_mappings())

    def __iter__(self):
        return iter(((f.from_idtype, f.to_idtype, f) for f in self._mappings))


def create():
    return SQLMappingProvider()
