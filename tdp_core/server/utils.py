import http
import logging
import time
import traceback

import werkzeug
from flask import Flask, jsonify

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
        # TODO: Evaluate if this should be set to manager.settings.is_development_mode
        app.debug = False

    if manager.settings.tdp_core:
        app.config["SECRET_KEY"] = manager.settings.secret_key

    @app.errorhandler(werkzeug.exceptions.HTTPException)
    @app.errorhandler(Exception)
    async def handle_exception(e):
        """Handles Flask exceptions by returning the same JSON response as FastAPI#HTTPException would."""
        _log.exception("An error occurred in Flask")
        # Extract status information if a Flask#HTTPException is given, otherwise return 500 with exception information
        status_code = e.code if isinstance(e, werkzeug.exceptions.HTTPException) else 500
        detail = detail_from_exception(e)
        # Exact same response as the one from FastAPI#HTTPException.
        return jsonify({"detail": detail or http.HTTPStatus(status_code).phrase}), status_code

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


def detail_from_exception(e: Exception) -> str:
    """Returns the full stacktrace in development mode and just the error message in production mode."""
    # Always return full stacktrace in development mode
    if manager.settings.is_development_mode:
        return "THIS STACKTRACE IS SHOWN IN DEVELOPMENT MODE ONLY. IN PRODUCTION, ONLY THE SPECIFIC ERROR MESSAGE IS SHOWN!" + "".join(
            traceback.format_exception(None, e, e.__traceback__)
        )
    # Exception specific returns
    if isinstance(e, werkzeug.exceptions.HTTPException):
        return e.description
    # Fallback to the string representation of the exception
    return str(e)
