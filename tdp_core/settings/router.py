from . import get_global_settings
from ..plugin.registry import list_plugins
from ..security.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(tags=["Configuration"], prefix="/api/tdp/config", dependencies=[Depends(get_current_user)])


@router.get("/{path:path}")
def get_config_path(path: str):
    path = path.split("/")
    key = path[0]

    plugin = next((p for p in list_plugins("tdp-config-safe-keys") if p.id == key), None)

    if plugin is None:
        raise HTTPException(status_code=404, detail=f'config key "{key}" not found')

    path[0] = plugin.configKey

    return get_global_settings().get_nested(".".join(path))


def create():
    return router
