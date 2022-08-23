from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, BaseSettings, Extra, Field

from .constants import default_logging_dict


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


class AlbSecurityStoreSettings(BaseModel):
    enable: bool = False
    cookie_name: Optional[str] = None
    signout_url: Optional[str] = None


class Auth0SecurityStoreSettings(BaseModel):
    enable: bool = False
    url: Optional[str] = None


class SecurityStoreSettings(BaseModel):
    alb_security_store: AlbSecurityStoreSettings = AlbSecurityStoreSettings()
    """Settings for the ALB security store"""
    auth0_store: Auth0SecurityStoreSettings = Auth0SecurityStoreSettings()
    """Settings for the Auth0 security store"""


class SecuritySettings(BaseModel):
    store: SecurityStoreSettings = SecurityStoreSettings()


class TDPCoreSettings(BaseModel):
    disable: DisableSettings = DisableSettings()
    enabled_plugins: List[str] = []

    # TODO: Proper typing. This is 1:1 passed to the logging.config.dictConfig(...).
    logging: Dict = Field(default_logging_dict)

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
    alwaysAppendDummyStore: bool = False  # NOQA
    security: SecuritySettings = SecuritySettings()

    # tdp_matomo
    matomo: MatomoSettings = MatomoSettings()

    # phovea_data_mongo
    mongo: MongoSettings = MongoSettings()


class GlobalSettings(BaseSettings):
    env: Literal["development", "production"] = "development"
    secret_key: str = "VERY_SECRET_STUFF_T0IB84wlQrdMH8RVT28w"

    # JWT options mostly inspired by flask-jwt-extended: https://flask-jwt-extended.readthedocs.io/en/stable/options/#general-options
    jwt_token_location: List[str] = ["headers", "cookies"]
    jwt_expire_in_seconds: int = 24 * 60 * 60
    jwt_refresh_if_expiring_in_seconds: int = 30 * 60
    jwt_algorithm: str = "HS256"
    jwt_access_cookie_name: str = "dv_access_token"
    jwt_header_name: str = "Authorization"
    jwt_header_type: str = "Bearer"
    jwt_cookie_secure: bool = False
    jwt_cookie_samesite: str = "Strict"
    jwt_access_cookie_path: str = "/"

    # General settings for tdp_core
    tdp_core: TDPCoreSettings = TDPCoreSettings()

    @property
    def is_development_mode(self) -> bool:
        return self.env.startswith("dev")

    def get_nested(self, key: str, default: Any = None) -> Optional[Any]:
        """
        Retrieves the value at the position of the key from the dict-ified settings, or `default` if `None` is found.
        This method is for legacy purposes only, you should in most cases just use the settings directly.
        """
        keys = key.split(".")
        plugin_id = keys[0]
        dic = self.dict(include={plugin_id})
        for key in keys:
            dic = dic.get(key, None) if dic else None
        return dic if dic is not None else default

    class Config:
        extra = Extra.allow
        env_nested_delimiter = "__"
