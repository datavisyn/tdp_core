from typing import Optional
from phovea_server import security
from phovea_server.config import view as viewconfig
import logging
import jwt


_log = logging.getLogger(__name__)
_conf = viewconfig('tdp_core.security.store.alb_security_store')


class ALBSecurityUser(security.User):
    def __init__(self, id, roles=[]):
        super().__init__(id)
        self.name = id
        self.roles = roles

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True


class ALBSecurityStore(object):

    def __init__(self, cookie_name: Optional[str], signout_url: Optional[str]):
        self.cookie_name = cookie_name
        self.signout_url: Optional[str] = signout_url

    def load(self, id):
        return None

    def load_from_request(self, req):
        if 'X-Amzn-Oidc-Identity' in req.headers and 'X-Amzn-Oidc-Accesstoken' in req.headers and 'X-Amzn-Oidc-Data' in req.headers:
            try:
                # Get token data from header
                encoded = req.headers['X-Amzn-Oidc-Data']
                # Try to decode the oidc data jwt
                user = jwt.decode(encoded, options={"verify_signature": False})
                # Create new user from given attributes
                email = user['email']
                return ALBSecurityUser(email)
            except Exception:
                _log.exception('Error in load_from_request')
                return None
        return None

    def load_from_key(self, token):
        return None

    def login(self, username, extra_fields={}):
        return None

    def logout(self, user):
        # https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html#authentication-logout
        cookies = []
        if self.cookie_name:
            cookies.append({'key': self.cookie_name, 'value': '', 'expires': -1})
        payload = {}
        # Redirect-URL to be triggered after logout. Makes sure to properly logout of the IdP provider.
        # See https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc#send-a-sign-out-request for details.
        if self.signout_url:
            payload['alb_security_store'] = {
                    'redirect': self.signout_url
            }

        return {
            'data': payload,
            'cookies': cookies
        }


def create():
    # Check if the security store is enabled.
    # Why do we do this here and not in the __init__.py?
    # Because the configuration is merged after the registry is loaded,
    # such that no keys are available (except phovea_server keys).
    if _conf.getboolean('enable', default=False):
        _log.info('Adding ALBSecurityStore')

        # Check if the url is set first
        cookie_name = _conf.get('cookie_name')
        signout_url = _conf.get('signout_url')
        # TODO: Validation of (optional) configuration?

        return ALBSecurityStore(cookie_name, signout_url)

    return None
