from functools import wraps
from typing import Dict, List, Optional, Union
from flask import request, abort, jsonify, render_template_string, Flask, Request
from phovea_server.security import SecurityManager as PhoveaServerSecurityManager, User as PhoveaServerUser
from phovea_server.plugin import list as list_plugins
from phovea_server.ns import no_cache
from phovea_server.config import view as configview
from ..store.dummy_store import create as create_dummy_store
from flask_jwt_extended import JWTManager, verify_jwt_in_request, get_jwt, unset_jwt_cookies, get_current_user, set_access_cookies, create_access_token
from datetime import datetime, timedelta, timezone
import logging


_log = logging.getLogger(__name__)

_config = configview('tdp_core')


class UserStore(object):
    def __init__(self):
        pass

    def load_from_key(self, api_key: str) -> Union[PhoveaServerUser, None]:
        return None

    def load_from_request(self, request: Request) -> Union[PhoveaServerUser, None]:
        return None

    def login(self, username, extra_fields={}) -> Union[PhoveaServerUser, None]:
        return None

    def logout(self, user) -> Optional[Dict]:
        pass

    def init_app(self, app: Flask):
        pass

    def init_jwt(self, jwt: JWTManager):
        pass


class JWTUser(PhoveaServerUser):
    def __init__(self, id: str, access_token: str, name: str = None, roles: List[str] = []):
        super().__init__(id, name, roles)
        self._access_token: str = access_token

    @property
    def access_token(self):
        # TODO: We simply return the incoming access token, but we should maybe use `create_access_token_from_user(...)`
        # and return it in case that this access token is expired, or empty?
        # Also, how should we handle if a non JWTUser user is returned, i.e. from a custom security store returning PhoveaServerUser?
        # Then, the utility function would be ideal to generate a token "on-the-fly".
        return self._access_token


# TODO: Use additional_claims_loader instead
def create_access_token_from_user(user: PhoveaServerUser) -> str:
    # TODO: Add "visible_name" here
    return create_access_token(identity=user.id, additional_claims={'roles': user.roles})


class JWTSecurityManager(PhoveaServerSecurityManager):
    def __init__(self):
        super().__init__()

        self.jwt: JWTManager = JWTManager()
        self.app: Flask = None

        # Retrieve all registered user stores
        self._user_stores = list(filter(None, [p.load().factory() for p in list_plugins('user_stores')]))
        if len(self._user_stores) == 0 or _config.getboolean('tdp_core.alwaysAppendDummyStore'):
            self._user_stores.append(create_dummy_store())

    def init_app(self, app: Flask):
        self.app = app

        # Load the config from the config.json, the options are mapped 1:1 from https://flask-jwt-extended.readthedocs.io/en/stable/options/
        app.config.update(**_config.get('security.jwt'))

        # Initialize the JWT with our main app
        self.jwt.init_app(app)

        # TODO: We allow loading of custom metadata into the token via the init_jwt in security stores,
        # are we planning to do the same in the other direction, i.e. modify the user object via the received payload?

        # Allow loading proper user objects by resolving token payload to actual users
        @self.jwt.user_lookup_loader
        def user_lookup_callback(_jwt_header, jwt_data):
            # TODO: How do we get the actual "raw" token here?
            return JWTUser(id=jwt_data["sub"], access_token='?', name=jwt_data.get('name'), roles=jwt_data.get('roles'))

        # Using an `after_request` callback, we refresh any token that is within a few minutes of expiring.
        # TODO: This only applies to the "main" app (no namespace plugins), such that it is triggered for loggedinas requests.
        @app.after_request
        def refresh_expiring_jwts(response):
            try:
                # TODO: Check if we actually want to do this here?
                # verify_jwt_in_request(optional=True)
                exp_timestamp = get_jwt()["exp"]
                now = datetime.now(timezone.utc)
                target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
                if target_timestamp > exp_timestamp:
                    user = self.current_user
                    access_token = create_access_token_from_user(user)
                    set_access_cookies(response, access_token)
                return response
            except (RuntimeError, KeyError):
                # Case where there is not a valid JWT. Just return the original respone
                return response

        # Add login, logout and loggedinas routes
        @app.route('/login', methods=['GET'])
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

        @app.route('/login', methods=['POST'])
        @no_cache
        def login():
            # Login the user with the current username/password
            user = self.login(request.values['username'], request.values)
            if not user:
                return abort(401)  # 401 Unauthorized

            # Create a new user response with the name and roles
            response = jsonify(name=user.name, roles=user.roles)
            # Create a new access token for this user
            access_token = create_access_token_from_user(user)
            # Append the access token as cookie
            set_access_cookies(response, access_token)
            return response

        @app.route('/logout', methods=['GET', 'POST'])
        @no_cache
        def logout():
            payload, cookies = self.logout()
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

        @app.route('/loggedinas', methods=['GET', 'POST'])
        @no_cache
        def loggedinas():
            u = self.current_user
            if u:
                _log.debug('user login: ' + u.name)
                # TODO: Return something interesting
                return jsonify(name=u.name, roles=u.roles)
            return '"not_yet_logged_in"'

        # Finally, init every store if any requires that
        for store in self._user_stores:
            # Check if the actual "init_app" method is implemented and then call it
            init_store_app = getattr(store, "init_app", None)
            if callable(init_store_app):
                init_store_app(app)
            # Check if the actual "init_jwt" method is implemented and then call it
            init_store_jwt = getattr(store, "init_jwt", None)
            if callable(init_store_jwt):
                init_store_jwt(self.jwt)

    def login_required(self, fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            u = self.current_user
            # Allow access only if a user is available
            if u:
                # TODO: Add ability to pass roles=[...], ids=[...], etc. to this decorator. Ideal usage looks like this:
                # TODO: Think about how stacking of these decorators works...
                # @login_required(roles=['can_read_views']) or # @login_required(ids=['admin'])
                return fn(*args, **kwargs)
            return abort(401)
        return decorator

    @property
    def current_user(self) -> PhoveaServerUser:
        try:
            return self._load_user_from_request(request)
        except Exception:
            _log.exception('Error fetching user from current request')
            return None

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

    def login(self, username, extra_fields=None) -> Union[PhoveaServerUser, None]:
        if extra_fields is None:
            extra_fields = {}

        for store in self._user_stores:
            u = store.login(username, extra_fields)
            if u:
                return u
        return None

    def _load_user_from_key(self, api_key) -> Union[PhoveaServerUser, None]:
        for store in self._user_stores:
            # first check if the actual "load_from_key" method is implemented and then call it
            load_from_key = getattr(store, "load_from_key", None)
            if callable(load_from_key):
                user = load_from_key(api_key)
                if user:
                    return user

    def _load_user_from_request(self, request) -> Union[PhoveaServerUser, None]:
        # First, try to load the user from the JWT token
        try:
            # Use the "main" app as context as it is the one with the proper configuration
            with self.app.app_context():
                # Trigger the verification to ensure the JWT is verified
                verify_jwt_in_request(optional=True)
                user = get_current_user()
                if user:
                    return user
        except RuntimeError:
            _log.exception('Error retrieving user from JWT')

        # then, try to login using the api_key url arg
        api_key = request.headers.get('apiKey')
        if api_key:
            user = self._load_user_from_key(api_key)
            if user:
                return user

        # then, try to login using Basic Auth
        api_key = request.headers.get('Authorization')
        if api_key:
            api_key = api_key.replace('Basic ', '', 1)
            try:
                import base64
                api_key = base64.b64decode(api_key)
            except TypeError:
                pass
            user = self._load_user_from_key(api_key)
            if user:
                return user

        # then, try to login using the actual request
        for store in self._user_stores:
            # first check if the actual "load_from_request" method is implemented and then call it
            load_from_req = getattr(store, "load_from_request", None)
            if callable(load_from_req):
                user = load_from_req(request)
                if user:
                    return user

        # finally, return None if all methods did not login the user
        return None


def create():
    # TODO: Add setting key to enable similar to the ALBSecurityStore
    return JWTSecurityManager()
