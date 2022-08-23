import pytest
from pytest_postgresql import factories
from pytest_postgresql.janitor import DatabaseJanitor


# creates a fixture named "postgresql_proc", fails if `pg_config --bindir` is not found
factories.postgresql_proc()  # postgresql://postgres:@127.0.0.1:<RANDOM_PORT>/tests,


@pytest.fixture(scope="session")
def db_url(postgresql_proc):
    d = postgresql_proc
    url = f"postgresql://{d.user}:{d.password}@{d.host}:{d.port}/{d.dbname}"
    janitor = DatabaseJanitor(d.user, d.host, d.port, d.dbname, d.version, d.password)
    janitor.init()

    yield url
    janitor.drop()


@pytest.mark.xfail(raises=FileNotFoundError, reason="Fails if `pg_config --bindir` is not found or fails")
def test_db_fixture(db_url):
    assert db_url
