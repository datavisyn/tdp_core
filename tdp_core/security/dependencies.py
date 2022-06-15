from fastapi import Request

from .. import manager
from .model import User


def get_current_user(request: Request) -> User:
    """FastAPI dependency for the user. Ensures the user is logged in.
    Usage:
    ```
    ...
    def route(user: User = Depends(get_current_user)):
        ...
    ```
    """
    # Iterate through list of user providers
    return manager.security.load_from_request(request)
