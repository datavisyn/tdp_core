from phovea_server.security import User as PhoveaServerUser
import hashlib
import logging


_log = logging.getLogger(__name__)


def hash_password(password, salt):
  return hashlib.sha512((password + salt).encode('utf-8')).hexdigest()


class User(PhoveaServerUser):
  def __init__(self, id, password, salt, roles):
    super().__init__(id=id, name=id, roles=roles)
    self._password = password
    self._salt = salt

  def is_password(self, given):
    given_h = hash_password(given, self._salt)
    return given_h == self._password


class UserStore(object):
  def __init__(self):
    import phovea_server.config

    # define users via env variables
    self._users = [User(v['name'], v['password'], v['salt'], v['roles']) for v in phovea_server.config.get('tdp_core.users')]

  def load_from_key(self, api_key):
    parts = api_key.split(':')
    if len(parts) != 2:
      return None
    return next((u for u in self._users if u.id == parts[0] and u.is_password(parts[1])), None)

  def login(self, username, extra_fields={}):
    return next((u for u in self._users if u.id == username and u.is_password(extra_fields['password'])), None)


def create():
  _log.info('using dummy store')
  return UserStore()
