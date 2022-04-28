import logging
import time

import werkzeug
from fastapi import HTTPException
from flask import Flask

from .. import manager

_log = logging.getLogger(__name__)


def init_legacy_app(app: Flask):
    """
    initializes an application by setting common properties and options
    :param app:
    :param is_default_app:
    :return:
    """
    if hasattr(app, "got_first_request") and app.got_first_request:
        return

    if hasattr(app, "debug"):
        app.debug = manager.settings.is_development_mode

    if manager.settings.tdp_core:
        app.config["SECRET_KEY"] = manager.settings.secret_key

    @app.errorhandler(werkzeug.exceptions.HTTPException)
    @app.errorhandler(Exception)
    def handle_exception(e):
        """Raises a proper fastapi#HTTPException instead of HTML for HTTP errors and exceptions."""
        _log.exception("An exception in a Flask app", exc_info=e)
        if isinstance(e, werkzeug.exceptions.HTTPException):
            raise HTTPException(status_code=e.code, detail=e.description)
        raise HTTPException(status_code=500, detail=str(e) if manager.settings.is_development_mode else "Internal server error")

    return app


def load_after_server_started_hooks():
    """
    Load and run all `after_server_started` extension points.
    The factory method of an extension implementing this extension point should return a function which is then executed here
    """
    from .. import manager

    _log = logging.getLogger(__name__)

    start = time.time()

    after_server_started_hooks = [p.load().factory() for p in manager.registry.list("after_server_started")]

    _log.info(f"Found {len(after_server_started_hooks)} `after_server_started` extension points to run")

    for hook in after_server_started_hooks:
        hook()

    _log.info("Elapsed time for server startup hooks: %d seconds", time.time() - start)
