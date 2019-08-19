from phovea_server.security import login_required
from .formatter import formatter
from .db import resolve_view
from functools import wraps


# custom login_required decorator to be able to disable the login for DBViews, i.e. to make them public
def tdp_login_required(func):
  @wraps(func)
  def decorated_view(*args, **kwargs):
    if kwargs.get('view_name', None) is not None and kwargs.get('database', None) is not None:
      view_name, _ = formatter(kwargs['view_name'])
      config, _, view = resolve_view(kwargs['database'], view_name)
      if isinstance(view.security, bool) and view.security is False:  # if security is disabled for the view just call it without checking the login
        return func(*args, **kwargs)
      return login_required(func)(*args, **kwargs)  # call the function returned by the decorator
    return login_required(func)(*args, **kwargs)

  return decorated_view
