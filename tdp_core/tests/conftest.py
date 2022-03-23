from typing import Any, Generator
from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from ..server.visyn_server import create_visyn_server
from ..plugin import parser


@pytest.fixture
def mock_plugins(monkeypatch):
    def mock_is_disabled_plugin(p):
        # Disable every non-tdp_core plugin for the test
        return p.id not in ['tdp_core']
    monkeypatch.setattr(parser, "is_disabled_plugin", mock_is_disabled_plugin)


@pytest.fixture
def app(mock_plugins) -> Generator[FastAPI, Any, None]:
    yield create_visyn_server()


@pytest.fixture(scope="function")
def client(
    app: FastAPI
) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
