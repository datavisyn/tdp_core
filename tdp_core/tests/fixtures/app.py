from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from ...plugin import parser
from ...security import permissions
from ...security.manager import SecurityManager
from ...server.visyn_server import create_visyn_server


@pytest.fixture
def mock_plugins(monkeypatch):
    def mock_is_disabled_plugin(p):
        # Disable every non-tdp_core plugin for the test
        return p.id not in ["tdp_core"]

    def mock_current_user_in_manager(self):
        return permissions.User(id="admin", name="admin")

    monkeypatch.setattr(parser, "is_disabled_plugin", mock_is_disabled_plugin)
    monkeypatch.setattr(SecurityManager, "current_user", property(mock_current_user_in_manager))


@pytest.fixture
def app(mock_plugins) -> Generator[FastAPI, Any, None]:
    yield create_visyn_server()


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
