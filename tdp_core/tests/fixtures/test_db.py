# create postgresql test db, using newest pg version
from pathlib import Path

import pytest
from pytest_postgresql import factories
from pytest_postgresql.janitor import DatabaseJanitor

# get highest version between 12 and 15, 14 on ubuntu 22.04
_paths = [f"/usr/lib/postgresql/{version}/bin/pg_ctl" for version in range(12, 16)]
_path = [p for p in _paths if Path(p).exists()][-1]  # if this fails, no pg_ctl found

# creates a fixture named "postgresql_proc"
factories.postgresql_proc(executable=_path, dbname="test", password="test")


@pytest.fixture(scope="session")
def db_url(postgresql_proc):
    d = postgresql_proc
    url = f"postgresql://{d.user}:{d.password}@{d.host}:{d.port}/{d.dbname}"
    janitor = DatabaseJanitor(d.user, d.host, d.port, d.dbname, d.version, d.password)
    janitor.init()

    yield url
    janitor.drop()

