from typing import TYPE_CHECKING

# Neat trick to avoid circular imports when importing modules for type hints only:
# TYPE_CHECKING is set to True when the type-checker runs, and we can safely import our types here (as nothing is evaluted).
# Additionally, we have to wrap our types/classes in '', such that they are evaluated lazily.
# See https://peps.python.org/pep-0563/#runtime-annotation-resolution-and-type-checking for more information.
if TYPE_CHECKING:
    from .dbmanager import DBManager
    from .dbmigration.manager import DBMigrationManager
    from .id_mapping.manager import MappingManager
    from .plugin.registry import Registry
    from .security.manager import SecurityManager
    from .settings.model import GlobalSettings


db: "DBManager" = None
db_migration: "DBMigrationManager" = None
id_mapping: "MappingManager" = None
security: "SecurityManager" = None
registry: "Registry" = None
settings: "GlobalSettings" = None
