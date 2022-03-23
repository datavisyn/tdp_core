# TODO: Move to test_main.py
def test_health(client):
    response = client.get("/health", headers={"Authorization": "admin:admin"})
    assert response.status_code == 200
    assert response.json() == "ok"


# TODO: Move to test_idtype.py
def test_idtype(client):
    response = client.get("/api/idtype/", headers={"Authorization": "admin:admin"})
    assert response.status_code == 200
    assert response.json() == []
