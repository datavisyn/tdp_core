def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == "ok"


def test_buildinfo_json(client):
    response = client.get("/api/buildInfo.json")
    assert response.status_code == 200
    build_info = response.json()
    # Check for the main build name
    assert build_info["name"] == "tdp_core"
    # Check if plugins are returned as list
    assert isinstance(build_info["plugins"], list)
    # Check if dependencies are returned (i.e. look for FastAPI)
    assert next(d for d in build_info["dependencies"] if d.lower().startswith("fastapi"))


def test_idtype(client):
    response = client.get("/api/idtype/")
    assert response.status_code == 200
    assert response.json() == []
