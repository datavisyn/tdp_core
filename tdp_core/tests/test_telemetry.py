import pytest
from fastapi.testclient import TestClient
from prometheus_client.parser import text_string_to_metric_families


@pytest.mark.parametrize(
    "workspace_config",
    [
        {
            "tdp_core": {
                "enabled_plugins": ["tdp_core"],
                "telemetry": {
                    "enabled": True,
                    "metrics": {"enabled": True},
                    "metrics_middleware": {"enabled": True},
                    "traces": {"enabled": False},
                    "logs": {"enabled": False},
                },
            },
        }
    ],
)
def test_fastapi_metrics(client: TestClient):
    # Trigger a request
    client.get("/health")
    parsed = {m.name: m for m in text_string_to_metric_families(client.get("/metrics").text)}

    # Check for app info
    fastapi_app_info_metric = parsed["fastapi_app_info_1"]  # TODO: Why _1?
    assert len(fastapi_app_info_metric.samples) == 1
    assert fastapi_app_info_metric.samples[0].labels["app_name"] == "app"

    # Check for request counts
    fastapi_requests_metric = parsed["fastapi_requests_1"]  # TODO: Why _1?
    assert len(fastapi_requests_metric.samples) == 2
    assert fastapi_requests_metric.samples[0].labels["path"] == "/health"
    assert fastapi_requests_metric.samples[0].value == 1
    assert fastapi_requests_metric.samples[1].labels["path"] == "/metrics"
    assert fastapi_requests_metric.samples[1].value == 1

    # Trigger it again
    client.get("/health")
    parsed = {m.name: m for m in text_string_to_metric_families(client.get("/metrics").text)}

    # And check for increased counts
    fastapi_requests_metric = parsed["fastapi_requests_1"]  # TODO: Why _1?
    assert len(fastapi_requests_metric.samples) == 2
    assert fastapi_requests_metric.samples[0].labels["path"] == "/health"
    assert fastapi_requests_metric.samples[0].value == 2
    assert fastapi_requests_metric.samples[1].labels["path"] == "/metrics"
    assert fastapi_requests_metric.samples[1].value == 2
