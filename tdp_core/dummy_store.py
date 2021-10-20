from . import flask_login_impl
import hashlib

__author__ = 'Samuel Gratzl'


def hash_password(password, salt):
  return hashlib.sha512((password + salt).encode('utf-8')).hexdigest()


class User(flask_login_impl.User):
  def __init__(self, id, password, salt, roles):
    super(User, self).__init__(id)
    self.name = id
    self._password = password
    self._salt = salt
    self.roles = roles

  @property
  def is_authenticated(self):
    return True

  @property
  def is_active(self):
    return True

  def is_password(self, given):
    given_h = hash_password(given, self._salt)
    return given_h == self._password


def from_env_var(k, v):
  elems = v.split(';')
  name = k[12:]  # PHOVEA_USER_
  salt = elems[0]
  password = elems[1]
  roles = elems[2:]
  return User(name, password, salt, roles)


class UserStore(object):
  def __init__(self):
    import phovea_server.config
    import os

    # define users via env variables
    env_users = [from_env_var(k, v) for k, v in os.environ.items() if k.startswith('PHOVEA_USER_')]
    if env_users:
      self._users = env_users
    else:
      self._users = [User(v['name'], v['password'], v['salt'], v['roles']) for v in
                     phovea_server.config.get('tdp_core.users')]

  def load(self, id):
    return next((u for u in self._users if u.id == id), None)

  def load_from_key(self, api_key):
    parts = api_key.split(':')
    if len(parts) != 2:
      return None
    return next((u for u in self._users if u.id == parts[0] and u.is_password(parts[1])), None)

  def login(self, username, extra_fields={}):
    return next((u for u in self._users if u.id == username and u.is_password(extra_fields['password'])), None)

  def logout(self, user):
    pass


def create():
  return UserStore()
