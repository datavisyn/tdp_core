import logging
from typing import Any, Dict, Union

from fastapi import FastAPI
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from . import manager
from .dbview import DBConnector
from .middleware.close_web_sessions_middleware import CloseWebSessionsMiddleware
from .middleware.request_context_middleware import get_request

_log = logging.getLogger(__name__)


class DBManager(object):
    def __init__(self):
        self._initialized = False

        self.connectors: Dict[str, DBConnector] = {}
        self._plugins = {}
        self._engines = dict()
        self._sessionmakers = dict()

    def init_app(self, app: FastAPI):
        app.add_middleware(CloseWebSessionsMiddleware)

        for p in manager.registry.list("tdp-sql-database-definition"):
            config: Dict[str, Any] = manager.settings.get_nested(p.configKey)  # type: ignore
            connector: DBConnector = p.load().factory()
            if not connector.dburl:
                connector.dburl = config["dburl"]
            if not connector.statement_timeout:
                connector.statement_timeout = config.get("statement_timeout", None)
            if not connector.statement_timeout_query:
                connector.statement_timeout_query = config.get("statement_timeout_query", None)
            if not connector.dburl:
                _log.critical(
                    "no db url defined for %s at config key %s - is your configuration up to date?",
                    p.id,
                    p.configKey,  # type: ignore
                )
                continue

            self._plugins[p.id] = p
            self.connectors[p.id] = connector

    def _load_engine(self, item):
        if not self._initialized:
            self._initialized = True
            for p in manager.registry.list("greenifier"):
                _log.info("run greenifier: %s", p.id)
                p.load().factory()
        if item in self._engines:
            return self._engines[item]

        p = self._plugins[item]
        connector = self.connectors[item]
        config = manager.settings.get_nested(p.configKey)

        engine = connector.create_engine(config)
        maker = connector.create_sessionmaker(engine)

        self._engines[item] = engine
        self._sessionmakers[engine] = maker

        return engine

    def connector_and_engine(self, item):
        if item not in self.connectors:
            raise NotImplementedError("missing db connector: " + item)
        return self.connectors[item], self._load_engine(item)

    def connector(self, item) -> DBConnector:
        if item not in self.connectors:
            raise NotImplementedError("missing db connector: " + item)
        return self.connectors[item]

    def engine(self, item: Union[Engine, str]) -> Engine:
        if isinstance(item, Engine):
            return item

        if item not in self.connectors:
            raise NotImplementedError("missing db connector: " + item)
        return self._load_engine(item)

    def create_session(self, engine_or_id: Union[Engine, str]) -> Session:
        return self._sessionmakers[self.engine(engine_or_id)]()

    def create_web_session(self, engine_or_id: Union[Engine, str]) -> Session:
        """
        Create a session that is added to the request state as db_session, which automatically closes it in the db_session middleware.
        """
        session = self.create_session(engine_or_id)

        try:
            existing_sessions = get_request().state.db_sessions
        except (KeyError, AttributeError):
            existing_sessions = []
            get_request().state.db_sessions = existing_sessions
        existing_sessions.append(session)

        return session
