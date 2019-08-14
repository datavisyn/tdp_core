from phovea_server.security import login_required
from .formatter import formatter
from .db import resolve_view


# custom login_required decorator to be able to disable the login for DBViews, i.e. to make them public
def tdp_login_required(func):
  def decorated_view(*args, **kwargs):
    if kwargs['view_name'] is not None and kwargs['database'] is not None:
      view_name, _ = formatter(kwargs['view_name'])
      config, _, view = resolve_view(kwargs['database'], view_name)
      if isinstance(view.security, bool) and view.security is False:  # if security is disabled for the view just call it without checking the login
        return func(*args, **kwargs)
      # check the login if security was not disabled
      return login_required(func)

    return login_required(func)

  # override the name of the decorated view, otherwise we get an internal server error when we use the decorator more than once
  decorated_view.__name__ = func.__name__
  return decorated_view
