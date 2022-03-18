from urllib.request import Request
from fastapi import Request
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
    from .manager import security_manager

    # Iterate through list of user providers
    return security_manager().load_from_request(request)
