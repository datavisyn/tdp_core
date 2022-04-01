import logging
from abc import ABC
from base64 import b64decode
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Dict, Optional

from flask import request, abort, jsonify, render_template_string, Flask, Request, Blueprint, current_app, _request_ctx_stack
from flask_jwt_extended import JWTManager, get_jwt, unset_jwt_cookies, get_current_user, set_access_cookies, \
    create_access_token, verify_jwt_in_request

from phovea_server.config import view as configview
from phovea_server.ns import no_cache
from phovea_server.plugin import list as list_plugins
from phovea_server.security import SecurityManager as PhoveaServerSecurityManager, User as PhoveaServerUser, manager as phoveaSecurityManager
from ..store.dummy_store import create as create_dummy_store

_log = logging.getLogger(__name__)
_config = configview('tdp_core')


class UserStore(ABC):
    def load_from_key(self, api_key: str) -> Optional[PhoveaServerUser]: return None
    def load_from_request(self, request: Request) -> Optional[PhoveaServerUser]: return None
    def login(self, username, extra_fields={}) -> Optional[PhoveaServerUser]: return None
    def logout(self, user) -> Optional[Dict]: pass
    def init_app(self, app: Flask): pass


class JWTSecurityManager(PhoveaServerSecurityManager):
    app: Flask

    def __init__(self):
        super().__init__()
        self.jwt: JWTManager = JWTManager()

        # Retrieve all registered user stores
        self._user_stores = list(filter(None, [p.load().factory() for p in list_plugins('user_stores')]))
        if len(self._user_stores) == 0 or _config.getboolean('tdp_core.alwaysAppendDummyStore'):
            self._user_stores.append(create_dummy_store())

    def init_app(self, app: Flask):
        self.app = app
        app.register_blueprint(blp)

        # Load the config from the config.json, the options are mapped 1:1 from
        # https://flask-jwt-extended.readthedocs.io/en/stable/options/
        app.config.update(**_config.get('security.jwt'))

        # Initialize the JWT with our main app
        self.jwt.init_app(app)

        @self.jwt.additional_claims_loader
        def additional_claims(identity):
            claims = {}
            try:
                claims.update({"additional_claims": {'roles': get_current_user().roles}})
            except RuntimeError:
                pass
            if app.config.get("JWT_ADDITIONAL_CLAIMS"):
                claims.update(app.config.get("JWT_ADDITIONAL_CLAIMS"))
            return claims

        # TODO: We allow loading of custom metadata into the token via the init_jwt in security stores,
        # are we planning to do the same in the other direction, i.e. modify the user object via the received payload?

        # Allow loading proper user objects by resolving token payload to actual users
        @self.jwt.user_lookup_loader
        def user_lookup_callback(_jwt_header, jwt_data):
            return PhoveaServerUser(id=jwt_data["sub"], name=jwt_data.get('name'), roles=jwt_data.get('roles'))

        # Using an `after_request` callback, we refresh any token that is within a few minutes of expiring.
        @blp.after_request
        def refresh_expiring_jwts(response):
            try:
                # TODO: Check if we actually want to do this here?
                # verify_jwt_in_request(optional=True)
                exp_timestamp = get_jwt()["exp"]
                now = datetime.now(timezone.utc)
                target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
                if target_timestamp > exp_timestamp:
                    access_token = create_access_token(self.current_user.name)
                    set_access_cookies(response, access_token)
                return response
            except (RuntimeError, KeyError):
                # Case where there is not a valid JWT. Just return the original respone
                return response

        self._delegate_stores_until_not_none("init_app")

    @property
    def current_user(self) -> Optional[PhoveaServerUser]:
        with self.app.app_context():  # used for jwt request
            verify_jwt_in_request()
            return get_current_user() or self._api_key_from_headers() or self._delegate_stores_until_not_none("load_from_request", request)

    def logout(self):
        u = self.current_user
        response_payload = {}
        response_cookies = []
        for store in self._user_stores:
            customizations = store.logout(u) or {}
            # data is an arbitrary Dict which is added to the response payload.
            response_payload.update(customizations.get('data') or {})
            # cookies is a list of Dicts which are passed 1:1 to response.set_cookie.
            response_cookies.extend(customizations.get('cookies') or [])
        return response_payload, response_cookies

    def login(self, username, extra_fields=None) -> Optional[PhoveaServerUser]:
        return self._delegate_stores_until_not_none("login", username, extra_fields or {})

    def _delegate_stores_until_not_none(self, store_method_name, *args):
        """ Run a method on ordered stores (if exists) until one doesn't return None """
        for store in self._user_stores:
            method = getattr(store, store_method_name, None)
            if callable(method):
                value = method(*args)
                if value:
                    return value

    def _api_key_from_headers(self) -> Optional[str]:
        # try to login using the api_key url arg
        api_key = request.headers.get('apiKey')
        if not api_key:
            # then, try to login using Basic Auth
            api_key = request.headers.get('Authorization')
            if api_key:
                api_key.replace('Basic ', '', 1)
                api_key = b64decode(api_key)
        if api_key:
            return self._delegate_stores_until_not_none("load_from_key", api_key)


def login_required(f=None, *, users=(), roles=()):
    """ Usage: @login_required or @login_required(users=("admin") or @login_required(roles=("admin")) """
    def login_required_inner(fn=None):
        @wraps(fn)
        def decorator(*args, **kwargs):
            u = phoveaSecurityManager().current_user
            # Allow access only if a user is available
            if not u:
                return abort(401, {'message': 'No user in login_required request'})
            if users and u.name not in users:
                return abort(401, {'message': 'User not in allowed_users in login_required request'})
            if roles and set(u.roles).intersection(roles):
                return abort(401, {'message': 'User role not in allowed_roles in login_required request'})
            return fn(*args, **kwargs)
        return decorator
    if f is None:
        return login_required_inner
    else:
        assert callable(f)
        login_required_inner(f)


# Add login, logout and loggedinas routes
blp = Blueprint("auth", __name__)


@blp.route('/login', methods=['GET'])
@no_cache
def get_login_mask():
    # return a login mask
    return render_template_string("""
                  <!DOCTYPE html>
                  <html>
                  <body>
                    <form name="login" action="/login" method="post" accept-charset="utf-8">
                      <div><label for="username" class="form-label">User name: </label><input type="text" name="username" placeholder="name" required="required"></div>
                      <div><label for="password" class="form-label">Password</label><input type="password" name="password" placeholder="password" required="required"></div>
                      <div><input type="reset" value="Reset"><input type="submit" value="Login"></div>
                    </form>
                  </body>
                  </html>
                 """)


@blp.route('/login', methods=['POST'])
@no_cache
def login():
    # Login the user with the current username/password
    user = phoveaSecurityManager().login(request.values['username'], request.values)
    if not user:
        return abort(401)  # 401 Unauthorized

    # Create a new user response with the name and roles
    response = jsonify(name=user.name, roles=user.roles)
    # Create a new access token for this user
    access_token = create_access_token(user.name)
    # Append the access token as cookie
    set_access_cookies(response, access_token)
    return response


@login_required()
@blp.route('/logout', methods=['GET', 'POST'])
@no_cache
def logout():
    verify_jwt_in_request()
    payload, cookies = phoveaSecurityManager().logout()
    # Create response and add security store payload
    response = jsonify(msg='Bye Bye', **payload)
    # Handle cookie changes from the security stores
    for cookie in cookies:
        try:
            response.set_cookie(**cookie)
        except Exception:
            _log.exception(f'Error setting cookie {cookie} to logout response')
    # Also unset the access token cookies
    unset_jwt_cookies(response)
    return response


@blp.route('/loggedinas', methods=['GET', 'POST'])
@no_cache
def loggedinas():
    verify_jwt_in_request()
    u = phoveaSecurityManager().current_user
    return jsonify(name=u.name, roles=u.roles) if u else abort(401)


def create():
    # TODO: Add setting key to enable similar to the ALBSecurityStore
    return JWTSecurityManager()
