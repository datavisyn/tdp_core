import pytest


def test_health(database):
    from sqlalchemy import create_engine
    engine = create_engine(database.url)
    engine.connect()


@pytest.mark.xfail(raises=FileNotFoundError, reason="Fails if `pg_config --bindir` is not found or fails")
def test_db_fixture(database):
    assert database
