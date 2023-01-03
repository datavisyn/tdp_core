import logging
import logging.config
import sys
import threading
from typing import Any, Dict, Optional

import anyio
from a2wsgi import WSGIMiddleware
from fastapi import FastAPI
from pydantic import create_model
from pydantic.utils import deep_update
from starlette_context.middleware import RawContextMiddleware

from ..settings.constants import default_logging_dict

# Initialize the logging very early as otherwise the already created loggers receive a default loglevel WARN, leading to logs not being shown.
logging.config.dictConfig(default_logging_dict)


def create_visyn_server(
    *, fast_api_args: Dict[str, Any] = {}, start_cmd: Optional[str] = None, workspace_config: Optional[Dict] = None
) -> FastAPI:
    """
    Create a new FastAPI instance while ensuring that the configuration and plugins are loaded, extension points are registered, database migrations are executed, ...

    Keyword arguments:
    fast_api_args: Optional dictionary of arguments directly passed to the FastAPI constructor.
    start_cmd: Optional start command for the server, i.e. db-migration exposes commands like `db-migration exec <..> upgrade head`.
    workspace_config: Optional override for the workspace configuration. If nothing is provided `load_workspace_config()` is used instead.
    """
    from .. import manager
    from ..settings.model import GlobalSettings
    from ..settings.utils import load_workspace_config

    # Load the workspace config.json and initialize the global settings
    workspace_config = workspace_config if isinstance(workspace_config, dict) else load_workspace_config()
    manager.settings = GlobalSettings(**workspace_config)
    logging.config.dictConfig(manager.settings.tdp_core.logging)

    # Filter out the metrics endpoint from the access log
    class EndpointFilter(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "GET /metrics" not in record.getMessage()

    logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

    _log = logging.getLogger(__name__)

    # Load the initial plugins
    from ..plugin.parser import get_config_from_plugins, load_all_plugins

    plugins = load_all_plugins()
    # With all the plugins, load the corresponding configuration files and create a new model based on the global settings, with all plugin models as sub-models
    [plugin_config_files, plugin_settings_models] = get_config_from_plugins(plugins)
    visyn_server_settings = create_model("VisynServerSettings", __base__=GlobalSettings, **plugin_settings_models)
    # Patch the global settings by instantiating the new settings model with the global config, all config.json(s), and pydantic models
    manager.settings = visyn_server_settings(**deep_update(*plugin_config_files, workspace_config))

    app = FastAPI(
        debug=manager.settings.is_development_mode,
        title="Visyn Server",
        # TODO: Extract version from package.json
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redoc_url="/api/redoc",
        **fast_api_args,
    )

    from ..middleware.exception_handler_middleware import ExceptionHandlerMiddleware

    # TODO: For some reason, a @app.exception_handler(Exception) is not called here. We use a middleware instead.
    app.add_middleware(ExceptionHandlerMiddleware)

    # Store all globals also in app.state.<manager> to allow access in FastAPI routes via request.app.state.<manager>.
    app.state.settings = manager.settings

    # Initialize global managers.
    from ..plugin.registry import Registry

    app.state.registry = manager.registry = Registry()
    manager.registry.init_app(app, plugins)

    from ..dbmanager import DBManager

    app.state.db = manager.db = DBManager()
    manager.db.init_app(app)

    from ..dbmigration.manager import DBMigrationManager

    app.state.db_migration = manager.db_migration = DBMigrationManager()
    manager.db_migration.init_app(app, manager.registry.list("tdp-sql-database-migration"))  # type: ignore

    from ..security.manager import create_security_manager

    app.state.security = manager.security = create_security_manager()
    manager.security.init_app(app)

    from ..id_mapping.manager import create_id_mapping_manager

    app.state.id_mapping = manager.id_mapping = create_id_mapping_manager()

    # TODO: Allow custom command routine (i.e. for db-migrations)
    from .cmd import parse_command_string

    alternative_start_command = parse_command_string(start_cmd)
    if alternative_start_command:
        _log.info(f"Received start command: {start_cmd}")
        alternative_start_command()
        _log.info("Successfully executed command, exiting server...")
        # TODO: How to properly exit here? Should a command support the "continuation" of the server, i.e. by returning True?
        sys.exit(0)

    # Load all namespace plugins as WSGIMiddleware plugins
    from .utils import init_legacy_app, load_after_server_started_hooks

    namespace_plugins = manager.registry.list("namespace")
    _log.info(f"Registering {len(namespace_plugins)} legacy namespace(s) via WSGIMiddleware")
    for p in namespace_plugins:
        namespace = p.namespace  # type: ignore

        sub_app = p.load().factory()
        init_legacy_app(sub_app)

        app.mount(namespace, WSGIMiddleware(sub_app))

    # Load all FastAPI apis
    router_plugins = manager.registry.list("fastapi_router")
    _log.info(f"Registering {len(router_plugins)} FastAPI router(s)")
    # Load all namespace plugins as WSGIMiddleware plugins
    for p in router_plugins:
        app.include_router(p.load().factory())

    # load `after_server_started` extension points which are run immediately after server started,
    # so all plugins should have been loaded at this point of time
    # the hooks are run in a separate (single) thread to not block the main execution of the server
    # TODO: Use FastAPI mechanism for that
    t = threading.Thread(target=load_after_server_started_hooks)
    t.daemon = True
    t.start()

    # TODO: Check mainapp.py what it does and transfer them here. Currently, we cannot mount a flask app at root, such that the flask app is now mounted at /app/
    from .mainapp import build_info, health

    # Call init_app callback for every plugin
    for p in plugins:
        p.plugin.init_app(app)

    from ..middleware.request_context_plugin import RequestContextPlugin

    # Use starlette-context to store the current request globally, i.e. accessible via context['request']
    app.add_middleware(RawContextMiddleware, plugins=(RequestContextPlugin(),))

    # TODO: Move up?
    app.add_api_route("/health", health)  # type: ignore
    app.add_api_route("/api/buildInfo.json", build_info)  # type: ignore

    @app.on_event("startup")
    async def change_anyio_total_tokens():
        # FastAPI uses anyio threads to handle sync endpoint concurrently.
        # This is a workaround to increase the number of threads to 100, as the default is only 40.
        limiter = anyio.to_thread.current_default_thread_limiter()
        limiter.total_tokens = manager.settings.tdp_core.total_anyio_tokens

    return app
