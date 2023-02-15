from pydantic import BaseModel
from visyn_core import manager


class MatomoSettings(BaseModel):
    url: str = ""
    site: str = "1"
    encryptUserName: bool = False  # NOQA


class MongoSettings(BaseModel):
    host: str = "mongo"
    port: int = 27017
    db_graph: str = "graph"
    db_namedsets: str = "targid"


class TDPCoreSettings(BaseModel):
    # tdp_matomo
    matomo: MatomoSettings = MatomoSettings()

    # phovea_data_mongo
    mongo: MongoSettings = MongoSettings()


def get_settings() -> TDPCoreSettings:
    return manager.settings.tdp_core  # type: ignore
