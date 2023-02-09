from fastapi.testclient import TestClient

from tdp_core import manager
from tdp_core.security.model import User
from tdp_core.security.store.alb_security_store import create as create_alb_security_store
from tdp_core.security.store.no_security_store import create as create_no_security_store


def test_api_key(client: TestClient):
    assert client.get("/loggedinas", headers={"apiKey": "invalid_user:password"}).json() == '"not_yet_logged_in"'
    assert client.get("/loggedinas", headers={"apiKey": "admin:admin"}).json()["name"] == "admin"


def test_basic_authorization(client: TestClient):
    assert client.get("/loggedinas", auth=("invalid_user", "password")).json() == '"not_yet_logged_in"'
    assert client.get("/loggedinas", auth=("admin", "admin")).json()["name"] == "admin"


def test_jwt_login(client: TestClient):
    # Add additional claims loaders
    @manager.security.jwt_claims_loader
    def claims_loader_1(user: User):
        return {"hello": "world"}

    @manager.security.jwt_claims_loader
    def claims_loader_2(user: User):
        return {"username": user.name}

    stores = client.get("/api/security/stores").json()
    assert stores == [{"id": "DummyStore", "ui": "DefaultLoginForm", "configuration": {}}]

    # Check if we are actually not logged in
    response = client.get("/loggedinas")
    assert response.status_code == 200
    assert response.json() == '"not_yet_logged_in"'

    # Login with the dummy user
    response = client.post("/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    user: dict = response.json()
    assert user["name"] == "admin"
    assert user["roles"] == ["admin"]
    assert user["payload"]["hello"] == "world"
    assert user["payload"]["username"] == "admin"

    # Check if we are logged in and get the same response as from the login
    response = client.get("/loggedinas")
    assert response.status_code == 200
    assert user == response.json()
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) == user["access_token"]
    )  # Access token is equal in response and cookies

    # Now, we set the timeout to refresh artificially high to force a jwt refresh
    original_jwt_refresh_if_expiring_in_seconds = manager.settings.jwt_refresh_if_expiring_in_seconds
    manager.settings.jwt_refresh_if_expiring_in_seconds = manager.settings.jwt_expire_in_seconds + 5

    # Check if we are still logged in and get the same response as the refresh happens *after* the request
    assert user == client.get("/loggedinas").json()
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) != user["access_token"]
    )  # Access token is different in response and cookies

    # Restore the original jwt refresh timeout
    manager.settings.jwt_refresh_if_expiring_in_seconds = original_jwt_refresh_if_expiring_in_seconds

    # Check if we are logged in and get a different response as the cookie was auto-refreshed in the last request
    refreshed_user = client.get("/loggedinas").json()
    assert user["name"] == refreshed_user["name"]  # Same user
    assert user["access_token"] != refreshed_user["access_token"]  # But different token
    assert user["payload"]["exp"] < refreshed_user["payload"]["exp"]  # With longer expiry date
    assert (
        client.cookies.get(manager.settings.jwt_access_cookie_name) == refreshed_user["access_token"]
    )  # Access token is equal in new response and cookies

    # Logout
    response = client.post("/logout")
    assert response.status_code == 200

    # Check if we are actually not logged in anymore
    response = client.get("/loggedinas")
    assert response.status_code == 200
    assert response.json() == '"not_yet_logged_in"'


def test_jwt_token_location(client: TestClient):
    # Login to set a cookie
    response = client.post("/login", data={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    access_token = response.json()["access_token"]

    # Disallow all methods
    manager.settings.jwt_token_location = []

    # Does not work even though both header and cookies are passed
    response = client.get("/loggedinas", headers={"Authorization": f"Bearer {access_token}"})
    assert response.json() == '"not_yet_logged_in"'

    # Allow headers
    manager.settings.jwt_token_location = ["headers"]

    # Does not work as only headers are accepted
    response = client.get("/loggedinas")
    assert response.json() == '"not_yet_logged_in"'

    # Does work as header is passed
    response = client.get("/loggedinas", headers={"Authorization": f"Bearer {access_token}"})
    assert response.json() == '"not_yet_logged_in"'

    # Allow cookies
    manager.settings.jwt_token_location = ["cookies"]

    # Does work even without header
    response = client.get("/loggedinas")
    assert response.json() != '"not_yet_logged_in"'


def test_alb_security_store(client: TestClient):
    # Add some basic configuration
    manager.settings.tdp_core.security.store.alb_security_store.enable = True
    manager.settings.tdp_core.security.store.alb_security_store.cookie_name = "TestCookie"
    manager.settings.tdp_core.security.store.alb_security_store.signout_url = "http://localhost/logout"

    store = create_alb_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    stores = client.get("/api/security/stores").json()
    assert stores == [{"id": "ALBSecurityStore", "ui": "AutoLoginForm", "configuration": {}}]

    # Header created with a random token containing "email"
    headers = {
        "X-Amzn-Oidc-Identity": "",
        "X-Amzn-Oidc-Accesstoken": "",
        "X-Amzn-Oidc-Data": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFkbWluQGxvY2FsaG9zdCIsInN1YiI6ImFkbWluIiwicm9sZXMiOlsiYWRtaW4iXSwiZXhwIjoxNjU3MTg4MTM4LjQ5NDU4Nn0.-Ye9j9z37gJdoKgrbeYbI8buSw_c6bLBShXt4XxwQHI",
    }

    # Check loggedinas with a JWT
    response = client.get("/loggedinas", headers=headers)
    assert response.status_code == 200
    assert response.json() != '"not_yet_logged_in"'
    assert response.json()["name"] == "admin@localhost"

    # Logout and check if we get the correct redirect url
    response = client.post("/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["alb_security_store"]["redirect"] == "http://localhost/logout"


def test_no_security_store(client: TestClient):
    # Add some basic configuration
    manager.settings.tdp_core.security.store.no_security_store.enable = True
    manager.settings.tdp_core.security.store.no_security_store.user = "test_name"
    manager.settings.tdp_core.security.store.no_security_store.roles = ["test_role"]

    store = create_no_security_store()
    assert store is not None

    manager.security.user_stores = [store]

    user_info = client.get("/loggedinas").json()
    assert user_info != '"not_yet_logged_in"'
    assert user_info["name"] == "test_name"
    assert user_info["roles"] == ["test_role"]
