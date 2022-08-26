from fastapi import FastAPI

from .plugin.model import AVisynPlugin, RegHelper


class VisynPlugin(AVisynPlugin):
    def init_app(self, app: FastAPI):
        from .mol_img import img_api

        app.include_router(img_api.app)

    def register(self, registry: RegHelper):
        # phovea_server
        registry.append(
            "namespace",
            "caleydo-dataset",
            "tdp_core.dataset.dataset_api",
            {"namespace": "/api/dataset", "factory": "create_dataset"},
        )
        registry.append(
            "namespace",
            "caleydo-idtype",
            "tdp_core.id_mapping.idtype_api",
            {"namespace": "/api/idtype", "factory": "create_idtype"},
        )
        registry.append("json-encoder", "numpy", "tdp_core.encoder.json_encoder")
        registry.append("json-encoder", "set-encoder", "tdp_core.encoder.set_encoder", {})

        registry.append(
            "dataset-specific-handler",
            "handler-graph",
            "tdp_core.dataset.graph.graph_api",
            {"datatype": "graph", "factory": "add_graph_handler"},
        )
        registry.append(
            "graph-formatter",
            "formatter-json",
            "tdp_core.dataset.graph.graph_api",
            {"format": "json", "factory": "format_json"},
        )
        registry.append(
            "graph-parser",
            "parser-json",
            "tdp_core.dataset.graph.graph_parser",
            {"format": "json", "factory": "parse_json"},
        )

        # tdp_core
        registry.append("namespace", "tdp_core", "tdp_core.proxy", {"namespace": "/api/tdp/proxy"})

        registry.append("namespace", "db_connector", "tdp_core.sql", {"namespace": "/api/tdp/db"})

        registry.append(
            "namespace",
            "tdp_storage",
            "tdp_core.storage",
            {"namespace": "/api/tdp/storage"},
        )
        registry.append("namespace", "tdp_swagger", "tdp_core.swagger", {"namespace": "/api/tdp/ui"})
        # TODO:
        registry.append("namespace", "tdp_core_main", "tdp_core.server.mainapp", {"namespace": "/app"})
        registry.append_router("tdp_config_router", "tdp_core.settings.router", {})
        registry.append_router("tdp_plugin_router", "tdp_core.plugin.router", {})
        registry.append("namespace", "tdp_xlsx2json", "tdp_core.xlsx", {"namespace": "/api/tdp/xlsx"})
        registry.append("mapping_provider", "tdp_core", "tdp_core.mapping_table")
        # TODO: Check if this is still required?
        registry.append("greenifier", "psycopg2", "tdp_core.sql_use_gevent", {})

        # DB migration plugins
        registry.append(
            "command",
            "db-migration",
            "tdp_core.dbmigration.manager",
            {"factory": "create_migration_command"},
        )
        registry.append(
            "namespace",
            "db-migration-api",
            "tdp_core.dbmigration.router",
            {"factory": "create_migration_api", "namespace": "/api/tdp/db-migration"},
        )

        # phovea_security_flask
        # TODO: Add ENV variables to allow disabling
        registry.append(
            "user_stores",
            "alb_security_store",
            "tdp_core.security.store.alb_security_store",
            {},
        )

        # tdp_matomo
        registry.append("tdp-config-safe-keys", "matomo", "", {"configKey": "tdp_core.matomo"})

        # phovea_data_mongo
        registry.append("dataset-provider", "dataset-graph", "tdp_core.graph", {})
