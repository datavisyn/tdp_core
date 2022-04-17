from fastapi import APIRouter, Depends, HTTPException

from .. import manager
from ..security.dependencies import get_current_user

router = APIRouter(tags=["Configuration"], prefix="/api/tdp/config", dependencies=[Depends(get_current_user)])


@router.get("/{path:path}")
def get_config_path(path: str):
    path = path.split("/")
    key = path[0]

    plugin = next((p for p in manager.registry.list("tdp-config-safe-keys") if p.id == key), None)

    if plugin is None:
        raise HTTPException(status_code=404, detail=f'config key "{key}" not found')

    path[0] = plugin.configKey

    return manager.settings.get_nested(".".join(path))


def create():
    return router
