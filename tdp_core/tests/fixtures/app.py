from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from ...security import permissions
from ...security.manager import SecurityManager
from ...server.visyn_server import create_visyn_server


@pytest.fixture
def mock_plugins(monkeypatch):
    def mock_current_user_in_manager(self):
        return permissions.User(id="admin")

    monkeypatch.setattr(SecurityManager, "current_user", property(mock_current_user_in_manager))


@pytest.fixture
def workspace_config() -> dict:
    return {
        "tdp_core": {"enabled_plugins": ["tdp_core"], "telemetry": {"enabled": False}},
    }


@pytest.fixture
def app(workspace_config) -> Generator[FastAPI, Any, None]:
    yield create_visyn_server(workspace_config=workspace_config)


@pytest.fixture
def client(app: FastAPI, request) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
