def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == "ok"


def test_idtype(client):
    response = client.get("/api/idtype/")
    assert response.status_code == 200
    assert response.json() == []
