import json
import logging
from ..settings import get_global_settings
import time

_log = logging.getLogger(__name__)


def init_legacy_app(app):
    """
    initializes an application by setting common properties and options
    :param app:
    :param is_default_app:
    :return:
    """
    if hasattr(app, "got_first_request") and app.got_first_request:
        _log.warn("already inited: " + str(app))
        return

    if hasattr(app, 'debug'):
        app.debug = get_global_settings().is_development_mode

    if get_global_settings().tdp_core:
        app.config['SECRET_KEY'] = get_global_settings().secret_key

    @app.errorhandler(500)
    def handle_exception(e):
        """Return JSON instead of HTML for HTTP errors."""
        # start with the correct headers and status code from the error
        response = e.get_response()
        # replace the body with JSON
        response.data = json.dumps({
            "status_code": e.code,
            "name": e.name,
            "detail": e.description,
        })
        response.content_type = "application/json"
        return response

    return app


def load_after_server_started_hooks():
    """
    Load and run all `after_server_started` extension points.
    The factory method of an extension implementing this extension point should return a function which is then executed here
    """
    from ..plugin.registry import list_plugins
    _log = logging.getLogger(__name__)

    start = time.time()

    after_server_started_hooks = [p.load().factory() for p in list_plugins("after_server_started")]

    _log.info(f"Found {len(after_server_started_hooks)} `after_server_started` extension points to run")

    for hook in after_server_started_hooks:
        hook()

    _log.info("Elapsed time for server startup hooks: %d seconds", time.time() - start)
