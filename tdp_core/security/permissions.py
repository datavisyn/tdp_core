from .constants import ANONYMOUS
from .manager import current_user
from .model import User

PERMISSION_READ = 4
PERMISSION_WRITE = 2
PERMISSION_EXECUTE = 1


def to_number(p_set):
    return (
        (PERMISSION_READ if PERMISSION_READ in p_set else 0)
        + (PERMISSION_WRITE if PERMISSION_WRITE in p_set else 0)
        + (PERMISSION_EXECUTE if PERMISSION_EXECUTE in p_set else 0)
    )


def to_string(p_set):
    return (
        ("r" if PERMISSION_READ in p_set else "-")
        + ("w" if PERMISSION_WRITE in p_set else "-")
        + ("x" if PERMISSION_EXECUTE in p_set else "-")
    )


def _from_number(p):
    r = set()
    if p >= 4:
        r.add(PERMISSION_READ)
        p -= 4
    if p >= 2:
        r.add(PERMISSION_WRITE)
        p -= 2
    if p >= 1:
        r.add(PERMISSION_EXECUTE)
    return r


DEFAULT_PERMISSION = 744


def _decode(permission=DEFAULT_PERMISSION):
    permission = int(permission)
    others = _from_number(permission % 10)
    group = _from_number((permission // 10) % 10)
    user = _from_number((permission // 100) % 10)
    buddies = _from_number((permission // 1000) % 10)
    return user, group, others, buddies


def _is_equal(a, b):
    if a == b:
        return True
    if not a or not b:
        return False
    a = a.lower()
    b = b.lower()
    return a == b


def _includes(items, item):
    if not item:
        return False
    for check in items:
        if _is_equal(check, item):
            return True
    return False


def can(item, permission: int, user: User = None):
    if user is None:
        user = current_user()

    if not isinstance(item, dict):
        # assume we have an object
        item = {
            "creator": getattr(item, "creator", ANONYMOUS),
            "buddies": getattr(item, "buddies", []),
            "group": getattr(item, "group", ANONYMOUS),
            "permissions": getattr(item, "permissions", DEFAULT_PERMISSION),
        }

    owner, group, others, buddies = _decode(item.get("permissions", DEFAULT_PERMISSION))

    # I'm the creator
    if _is_equal(user.name, item.get("creator", ANONYMOUS)) and permission in owner:
        return True

    # check if I'm in the buddies list
    if "buddies" in item and _includes(item.get("buddies"), user.name) and permission in buddies:
        return True

    # check if I'm in the group
    if "group" in item and _includes(user.roles, item.get("group")) and permission in group:
        return True

    return permission in others


def can_read(data_description, user=None):
    return can(data_description, PERMISSION_READ, user)


def can_write(data_description, user=None):
    return can(data_description, PERMISSION_WRITE, user)


def can_execute(data_description, user=None):
    return can(data_description, PERMISSION_EXECUTE, user)
