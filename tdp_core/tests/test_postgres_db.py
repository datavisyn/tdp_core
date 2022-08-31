import pytest


@pytest.mark.xfail(raises=FileNotFoundError, reason="Fails if `pg_config --bindir` is not found or fails")
def test_health(postgres_db):
    from sqlalchemy import create_engine

    engine = create_engine(postgres_db.url)
    engine.connect()


@pytest.mark.xfail(raises=FileNotFoundError, reason="Fails if `pg_config --bindir` is not found or fails")
def test_db_fixture(postgres_db):
    assert postgres_db
