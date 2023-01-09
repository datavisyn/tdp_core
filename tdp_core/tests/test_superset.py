from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.testclient import TestClient
from superset.app import create_app


def test_superset_health(client: TestClient):
    app: FastAPI = client.app  # type: ignore
    # TODO: Create config or simply init it like this function does
    superset_app = create_app()
    # Mount it as a WSGI middleware
    app.mount("/api/superset/", WSGIMiddleware(superset_app))

    # Test the health endpoint
    response = client.get("/api/superset/health")
    assert response.status_code == 200
    assert response.text == "OK"
