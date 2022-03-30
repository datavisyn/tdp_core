import logging
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, BaseSettings, Extra, Field

_log = logging.getLogger(__name__)


class DBMigrationSettings(BaseModel):
    autoUpgrade: bool = True  # NOQA


class MatomoSettings(BaseModel):
    url: str = ""
    site: str = "1"
    encryptUserName: bool = False  # NOQA


class MongoSettings(BaseModel):
    host: str = "mongo"
    port: int = 27017
    db_graph: str = "graph"
    db_namedsets: str = "targid"


class DisableSettings(BaseModel):
    plugins: List[str] = []
    extensions: List[str] = []


class VisynServerSettings(BaseModel):
    disable: DisableSettings = DisableSettings()
    enabled_plugins: List[str] = []

    # TODO: Proper typing. This is 1:1 passed to the logging.config.dictConfig(...).
    logging: Dict = Field(
        {
            "version": 1,
            "formatters": {
                "simple": {
                    "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
                    "datefmt": "%H:%M:%S",
                },
                "line": {"format": "%(asctime)s %(levelname)s %(name)s(%(pathname)s:%(lineno)s): %(message)s"},
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "simple",
                    "stream": "ext://sys.stdout",
                }
            },
            "loggers": {"geventwebsocket.handler": {"level": "WARN", "handlers": ["console"]}},
            "root": {"level": "INFO", "handlers": ["console"]},
        }
    )

    # tdp_core
    migrations: DBMigrationSettings = DBMigrationSettings()

    # phovea_security_flask
    users: List[Dict[str, Any]] = Field(
        [
            {
                "name": "admin",
                "salt": "dcf46ce914154a44b1557eba91c1f50d",
                "password": "e464485eeeca97927191bd77e38137cc5870c53efb05c8ec027faa8d47f0c0ee23e733ea5e494cb045ca46b0f3b6f695b7261a34f46ba3797cde67724d78522a",
                "roles": ["admin"],
            },
            {
                "name": "sam",
                "salt": "2338b858597b4937ad1c5db4b524f56d",
                "password": "814cbf874d3da7c01327b50c96bedf7db26357e0b4be25623242a33b33861651c3efd90d5c1a6410a646f356c73adf2de473611dee158672e8ee073767dc88f2",
                "roles": ["sam", "admin"],
            },
        ]
    )
    alwaysAppendDummyStore: bool = Field(False)  # NOQA
    security: Dict[str, Any] = Field(
        {
            "store": {
                "alb_security_store": {
                    "enable": False,
                    "cookie_name": None,
                    "signout_url": None,
                }
            }
        }
    )

    # tdp_matomo
    matomo: MatomoSettings = MatomoSettings()

    # phovea_data_mongo
    mongo: MongoSettings = MongoSettings()


class GlobalSettings(BaseSettings):
    env: Literal["development", "production"] = "development"
    secret_key: str = "VERY_SECRET_STUFF_T0IB84wlQrdMH8RVT28w"
    start_cmd: Optional[str] = Field(
        None,
        title="Start command",
        description="Optional start command for the server, i.e. db-migration exposes commands like `db-migration exec <..> upgrade head`.",
    )
    tdp_core: VisynServerSettings = VisynServerSettings()

    @property
    def is_development_mode(self) -> bool:
        return self.env.startswith("dev")

    def get_nested(self, key: str, default: Any = None) -> Union[Any, None]:
        # TODO: Set deprecated
        # TODO: Make sure that env is loaded here
        keys = key.split(".")
        plugin_id = keys[0]
        dic = self.dict(include={plugin_id})
        for key in keys:
            dic = dic.get(key, None) if dic else None
        return dic if dic is not None else default

    class Config:
        extra = Extra.allow
        env_nested_delimiter = "__"


__global_settings: GlobalSettings = None


def get_global_settings() -> GlobalSettings:
    global __global_settings
    if __global_settings is None:
        raise Exception("Global setting is not yet initialized!")
    return __global_settings
