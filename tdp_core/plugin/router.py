from ..plugin.registry import get_registry
from ..security.dependencies import get_current_user
from fastapi import APIRouter, Depends


router = APIRouter(tags=["Plugins"], prefix="/api/tdp", dependencies=[Depends(get_current_user)])


@router.get("/plugin")
def get_plugins():
    # TODO: Create models out of that
    return {
        "plugins": [{
            "id": p.id,
            "name": p.name,
            "title": p.title,
            "description": p.description,
            "version": p.version,
        } for p in get_registry().plugins],
        "extensions": [{
            "type": e.type,
            "id": e.id,
            "name": e.name,
            "description": e.description,
            "version": e.version,
        } for e in get_registry().list()]
    }


def create():
    return router
