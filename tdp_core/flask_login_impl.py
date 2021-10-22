
import phovea_server.security as security
import phovea_server.config
import flask_login
import logging


__author__ = 'Samuel Gratzl'
_log = logging.getLogger(__name__)


class User(security.User, flask_login.UserMixin):
  def __init__(self, id):
    self.id = id
    pass

  def get_id(self):
    return str(self.id)


class UserStore(object):
  def __init__(self):
    pass

  def load(self, id):
    return None

  def load_from_key(self, api_key):
    return None

  def login(self, username, extra_fields={}):
    return None

  def logout(self, user):
    pass


class NamespaceLoginManager(security.SecurityManager):
  def __init__(self):
    super(NamespaceLoginManager, self).__init__()
    self._manager = flask_login.LoginManager()
    self._manager.user_loader(self._load_user)
    self._manager.request_loader(self._load_user_from_request)
    self._manager.login_view = None

    import phovea_server.plugin as plugin
    self._user_stores = list(filter(None, [p.load().factory() for p in plugin.list('user_stores')]))
    if len(self._user_stores) == 0 or phovea_server.config.get('phovea_security_flask.alwaysAppendDummyStore'):
      _log.info('using dummy store')
      from . import dummy_store
      self._user_stores.append(dummy_store.create())

  def _load_user(self, id):
    for store in self._user_stores:
      u = store.load(id)
      if u:
        return u
    return None

  def init_app(self, app):
    self._manager.init_app(app)

  def add_login_routes(self, app):
    from phovea_server import ns

    @app.route('/login', methods=['GET', 'POST'])
    @ns.no_cache
    def login():
      if ns.request.method == 'POST':
        user = ns.request.values['username']
        user_obj = self.login(user, ns.request.values)
        if not user_obj:
          return ns.abort(401)  # 401 Unauthorized
        _log.debug('user login: ' + user)
        return ns.jsonify(name=user_obj.name, roles=user_obj.roles)

      # return a login mask
      login_mask = """
      <!DOCTYPE html>
      <html>
      <body>
        <form name="login" action="/login" method="post" accept-charset="utf-8">
          <div><label for="username" class="form-label">User name: </label><input type="text" name="username" placeholder="name" required="required"></div>
          <div><label for="password" class="form-label">Password</label><input type="password" name="password" placeholder="password" required="required"></div>
          <div><label for="remember" class="form-label"><input type="checkbox" name="remember" value="True" required="required"></label></div>
          <div><input type="reset" value="Reset"><input type="submit" value="Login"></div>
        </form>
      </body>
      </html>
      """
      return ns.render_template_string(login_mask)

    @app.route('/logout', methods=['POST'])
    @ns.no_cache
    def logout():
      self.logout()
      return ns.jsonify(msg='Bye Bye')

    @app.route('/loggedinas', methods=['POST'])
    def loggedinas():
      if self.is_authenticated():
        user_obj = self.current_user
        _log.debug('user login: ' + user_obj.name)
        return ns.jsonify(name=user_obj.name, roles=user_obj.roles)
      return '"not_yet_logged_in"'

  def login_required(self, f):
    return flask_login.login_required(f)

  @property
  def current_user(self):
    return flask_login.current_user

  def logout(self):
    u = self.current_user
    _log.debug('user logout: ' + (u.name if hasattr(u, 'name') else str(u)))
    for store in self._user_stores:
      store.logout(u)
    flask_login.logout_user()

  def login(self, username, extra_fields=None):
    if extra_fields is None:
      extra_fields = {}

    def str2bool(v):
      return v if isinstance(v, bool) else v.lower() in ('yes', 'true', 't', '1')

    for store in self._user_stores:
      u = store.login(username, extra_fields)
      if u:
        flask_login.login_user(u, remember=str2bool(extra_fields.get('remember', False)))
        return u
    return None

  def _load_user_from_key(self, api_key):
    for store in self._user_stores:
      u = store.load_from_key(api_key)
      if u:
        return u

  def _load_user_from_request(self, request):
    # first, try to login using the api_key url arg
    api_key = request.headers.get('apiKey')
    if api_key:
      user = self._load_user_from_key(api_key)
      if user:
        return user

    # next, try to login using Basic Auth
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

    # next, try to login using the actual request
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
  return NamespaceLoginManager()
