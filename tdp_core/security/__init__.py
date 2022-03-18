# TODO: This file was previously in the tdp_core/security.py file, causing a name conflict with this package.
from .manager import login_required, current_username, current_user, is_logged_in
from .permissions import can_execute, can_read, can_write, can, _includes
from ..formatter import formatter
from functools import wraps


# custom login_required decorator to be able to disable the login for DBViews, i.e. to make them public
def login_required_for_dbviews(func):
    from ..db import resolve_view

    @wraps(func)
    def decorated_view(*args, **kwargs):
        if kwargs.get("view_name", None) is not None and kwargs.get("database", None) is not None:
            view_name, _ = formatter(kwargs["view_name"])
            config, _, view = resolve_view(kwargs["database"], view_name)
            if isinstance(view.security, bool) and view.security is False:  # if security is disabled for the view just call it without checking the login
                return func(*args, **kwargs)
            return login_required(func)(*args, **kwargs)  # call the function returned by the decorator
        return login_required(func)(*args, **kwargs)

    return decorated_view
