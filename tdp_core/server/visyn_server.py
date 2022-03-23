import threading
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
import logging
import logging.config
from pydantic import create_model
from pydantic.utils import deep_update
from .request_context import RequestContextMiddleware
import sys


def create_visyn_server(*, fast_api_args: dict = {}) -> FastAPI:
    from ..settings import model as settings_model, get_global_settings
    from ..settings.utils import load_workspace_config

    # Load the workspace config.json and initialize the global settings
    workspace_config = load_workspace_config()
    settings_model.__global_settings = settings_model.GlobalSettings(**workspace_config)
    logging.config.dictConfig(get_global_settings().tdp_core.logging)
    logging.info('Workspace settings successfully loaded')

    # Load the initial plugins
    from ..plugin.parser import load_all_plugins, get_config_from_plugins
    plugins = load_all_plugins()
    # With all the plugins, load the corresponding configuration files and create a new model based on the global settings, with all plugin models as sub-models
    [plugin_config_files, plugin_settings_models] = get_config_from_plugins(plugins)
    visyn_server_settings = create_model('VisynServerSettings', __base__=settings_model.GlobalSettings, **plugin_settings_models)
    # Patch the global settings by instantiating the new settings model with the global config, all config.json(s), and pydantic models
    settings_model.__global_settings = visyn_server_settings(**deep_update(*plugin_config_files, workspace_config))
    logging.info('All settings successfully loaded')

    # Finally, initialize the registry as the config is now up-to-date
    from ..plugin import registry
    registry.__registry = registry.Registry(plugins)
    logging.info('Plugin registry successfully initialized')

    # Allow custom command routine (i.e. for db-migrations)
    from .cmd import parse_command_string
    alternative_start_command = parse_command_string(get_global_settings().start_cmd)
    if alternative_start_command:
        logging.info(f"Received start command: {get_global_settings().start_cmd}")
        alternative_start_command()
        logging.info('Successfully executed command, exiting server...')
        # TODO: How to properly exit here? Should a command support the "continuation" of the server, i.e. by returning True?
        sys.exit(0)

    # Initialize global managers. TODO: Should we do that by loading all singletons in the registry?
    from ..dbmigration.manager import get_db_migration_manager
    get_db_migration_manager()

    app = FastAPI(
        # TODO: Remove debug
        debug=get_global_settings().is_development_mode,
        title="Visyn Server",
        # TODO: Extract version from package.json
        version="1.0.0",
        docs_url="/api/docs",
        openapi_url="/api/openapi.json",
        redoc_url="/api/redoc",
        **fast_api_args
    )
    # Add middleware to access Request "outside"
    app.add_middleware(RequestContextMiddleware)

    # TODO: Check mainapp.py what it does and transfer them here. Currently, we cannot mount a flask app at root, such that the flask app is now mounted at /app/
    from .mainapp import build_info, health
    app.add_api_route('/health', health)
    app.add_api_route('/buildInfo.json', build_info)

    # Load all namespace plugins as WSGIMiddleware plugins
    from ..plugin.registry import list_plugins
    from .utils import init_legacy_app, load_after_server_started_hooks
    namespace_plugins = list_plugins("namespace")
    logging.info(f"Registering {len(namespace_plugins)} legacy namespaces via WSGIMiddleware")
    for p in namespace_plugins:
        logging.info(f"Registering legacy namespace: {p.namespace}")
        app.mount(p.namespace, WSGIMiddleware(init_legacy_app(p.load().factory())))

    # Load all FastAPI apis
    router_plugins = list_plugins("fastapi_router")
    logging.info(f"Registering {len(router_plugins)} API-routers")
    # Load all namespace plugins as WSGIMiddleware plugins
    for p in router_plugins:
        logging.info(f"Registering router: {p.id}")
        app.include_router(p.load().factory())

    # Initialize the login routes
    from ..security.manager import security_manager
    security_manager().init_app(app)

    # load `after_server_started` extension points which are run immediately after server started,
    # so all plugins should have been loaded at this point of time
    # the hooks are run in a separate (single) thread to not block the main execution of the server
    # TODO: Use FastAPI mechanism for that
    t = threading.Thread(target=load_after_server_started_hooks)
    t.daemon = True
    t.start()

    return app
