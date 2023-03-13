from typing import Any, Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from visyn_core.security import permissions
from visyn_core.security.manager import SecurityManager
from visyn_core.server.visyn_server import create_visyn_server


@pytest.fixture()
def _mock_plugins(monkeypatch):
    def mock_current_user_in_manager(self):
        return permissions.User(id="admin")

    monkeypatch.setattr(SecurityManager, "current_user", property(mock_current_user_in_manager))


@pytest.fixture()
def app() -> FastAPI:
    return create_visyn_server(
        workspace_config={
            "visyn_core": {"enabled_plugins": ["tdp_core", "visyn_core"]},
        }
    )


@pytest.fixture()
def client(app: FastAPI) -> Generator[TestClient, Any, None]:
    with TestClient(app) as client:
        yield client
