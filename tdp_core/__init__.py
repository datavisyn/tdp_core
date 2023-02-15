from fastapi import FastAPI
from pydantic import BaseModel
from visyn_core.plugin.model import AVisynPlugin, RegHelper

from .settings import TDPCoreSettings


class VisynPlugin(AVisynPlugin):
    def init_app(self, app: FastAPI):
        pass

    def register(self, registry: RegHelper):
        import logging

        _log = logging.getLogger(__name__)

        # phovea_server
        registry.append(
            "namespace",
            "caleydo-dataset",
            "tdp_core.dataset.dataset_api",
            {"namespace": "/api/dataset", "factory": "create_dataset"},
        )

        try:
            import numpy  # noqa, type: ignore

            registry.append("json-encoder", "numpy", "tdp_core.encoder.json_encoder")
        except ImportError:
            _log.info('numpy not available, skipping "numpy" json encoder')

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

        # tdp_matomo
        registry.append("tdp-config-safe-keys", "matomo", "", {"configKey": "tdp_core.matomo"})

        # phovea_data_mongo
        registry.append("dataset-provider", "dataset-graph", "tdp_core.graph", {})

    @property
    def setting_class(self) -> type[BaseModel]:
        return TDPCoreSettings
