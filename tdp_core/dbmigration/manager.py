import logging
import re
from argparse import REMAINDER
from os import path
from typing import Any

import alembic.command
import alembic.config
from alembic.util.exc import CommandError
from fastapi import FastAPI

from .. import manager
from ..plugin.registry import AExtensionDesc

__author__ = "Datavisyn"
_log = logging.getLogger(__name__)

alembic_cfg = alembic.config.Config(path.join(path.abspath(path.dirname(__file__)), "dbmigration.ini"))


class DBMigration:
    """
    DBMigration object stores the required arguments to execute commands using Alembic.
    """

    def __init__(
        self,
        id: str,
        db_url: str,
        script_location: str,
        *,
        auto_upgrade: bool = False,
        version_table_schema: str | None = None,
    ):
        """
        Initializes a new migration object and optionally carries out an upgrade.
        :param str id: ID of the migration object
        :param str db_url: DB connection url
        :param str script_location: Location of the base directory (containing env.py and the versions directory)
        :param bool auto_upgrade: True if the migration should automatically upgrade the database to head
        :param str version_table_schema: Schema of the alembic version table
        """
        if not id or not db_url or not script_location:
            raise ValueError("Empty id or db_url or script_location")

        self.id: str = id
        self.db_url: str = db_url
        self.script_location: str = script_location
        self.auto_upgrade: bool = auto_upgrade
        self.version_table_schema: str | None = version_table_schema
        self.custom_commands: dict[str, str] = {}

        # Because we can't easily pass "-1" as npm argument, we add a custom command for that without the space
        self.add_custom_command(r"downgrade-(\d+)", "downgrade -{}")

        # Automatically upgrade to head (if enabled)
        if self.auto_upgrade:
            _log.info(f"Upgrading database {self.id}")
            try:
                self.execute(["upgrade", "head"])
                _log.info(f"Successfully upgraded database {self.id}")
            # As alembic is actually a commandline tool, it sometimes uses sys.exit (https://github.com/sqlalchemy/alembic/blob/master/alembic/util/messaging.py#L63)
            except (SystemExit, CommandError):
                _log.exception(f"Error upgrading database {self.id}")

    def __repr__(self) -> str:
        return f"DBMigration({self.id})"

    def __str__(self) -> str:
        return self.id

    def add_custom_command(self, pattern: str, target: str):
        r"""
        Adds a custom command to the migration.

        :param str pattern: Regex pattern of the command. Can include capture groups which will be used to format the target string.
        :param str target: Target pattern for the command. Can include .format placeholders such as {} or {0} which will be replaced by the captured group.

        Example usage: Rewriting the command 'downgrade-<number>' to 'downgrade -<number>'
        can be done with the pattern 'downgrade-(\d+)' and the target 'downgrade -{}'.
        """
        self.custom_commands[pattern] = target

    def remove_custom_command(self, origin: str):
        self.custom_commands.pop(origin, None)

    def get_custom_command(self, arguments: list[str] | None = None) -> list[str] | None:
        """
        Returns the rewritten command if it matches the pattern of a custom command.
        :param List[str] arguments: Argument to rewrite.
        """
        if arguments:
            # Join the list with spaces
            arguments_str = " ".join(arguments)
            # For all the command patterns we have ..
            for key, value in self.custom_commands.items():
                # .. check if we can match the command pattern with the given string
                matched = re.match(f"{key}$", arguments_str)
                if matched:
                    # If we have a match, call format with the captured groups and split by ' '
                    return value.format(*matched.groups()).split(" ")
        return None

    def execute(self, arguments: list[str] | None = None) -> bool:
        """
        Executes a command on the migration object.
        :param List[str] arguments: Arguments for the underlying Alembic instance. See https://alembic.sqlalchemy.org/en/latest/api/ for details.

        Example usage: migration.execute(['upgrade', 'head']) upgrades to the database to head.
        """
        if arguments is None:
            arguments = []
        # Rewrite command if possible
        rewritten_arguments = self.get_custom_command(arguments)
        if rewritten_arguments:
            _log.info(f"Command {' '.join(arguments)} was rewritten to {' '.join(rewritten_arguments)}")
            arguments = rewritten_arguments

        # Setup an alembic command line parser to parse the arguments
        cmd_parser = alembic.config.CommandLine()

        # Parse the options (incl. validation)
        options = cmd_parser.parser.parse_args(arguments)

        # Inject options in the configuration object
        alembic_cfg.cmd_opts = options
        alembic_cfg.set_main_option("script_location", self.script_location)
        alembic_cfg.set_main_option("sqlalchemy.url", self.db_url)
        alembic_cfg.set_main_option("migration_id", self.id)
        if self.version_table_schema:
            alembic_cfg.set_main_option("version_table_schema", self.version_table_schema)

        # Run the command
        cmd_parser.run_cmd(alembic_cfg, options)

        return True


class DBMigrationManager:
    """
    DBMigrationManager retrieves all 'tdp-sql-database-migration' plugins and initializes DBMigration objects.
    The possible configuration keys for this extension point are:
    - configKey: Key of the configuration entry (i.e. <app_name>.migration)
    - id: ID of the migration for logging purposes (passed to DBManager)
    - dbKey: Key of the engine used for the migration (passed to DBManager)
    - dbUrl: URL of the db connection used for the migration (passed to DBManager)
      - Either dbKey or dbUrl is required, with dbUrl having precedence
    - scriptLocation: Location of the alembic root folder (passed to DBManager)
    - autoUpgrade: Flag which auto-upgrades to the latest revision (passed to DBManager). Defaults to config key 'tdp_core.migrations.autoUpgrade', or True if not configured.
    - versionTableSchema: Schema of the alembic version table (passed to DBManager)

    The keys are retrieved from the following sources (in order):
    - File configuration at configKey
    - Plugin configuration
    """

    def __init__(self):
        self._migrations: dict[str, DBMigration] = {}

    def init_app(self, app: FastAPI, plugins: list[AExtensionDesc] | None = None):
        if plugins is None:
            plugins = []
        _log.info(f"Initializing DBMigrationManager with {', '.join([p.id for p in plugins]) or 'no plugins'}")
        auto_upgrade_default = manager.settings.tdp_core.migrations.autoUpgrade

        for p in plugins:
            _log.info(f"Database migration found: {p.id}")

            # TODO: The AExtensionDesc doesn't have any typing information, so we need to cast it to Any here
            p: Any = p

            # Check if configKey is set, otherwise use the plugin configuration
            config: dict = manager.settings.get_nested(p.configKey, {}) if hasattr(p, "configKey") else {}  # type: ignore

            # Priority of assignments: Configuration File -> Plugin Definition
            id = config.get("id") or (p.id if hasattr(p, "id") else None)
            db_key = config.get("dbKey") or (p.dbKey if hasattr(p, "dbKey") else None)
            db_url = config.get("dbUrl") or (p.dbUrl if hasattr(p, "dbUrl") else None)
            script_location = config.get("scriptLocation") or (p.scriptLocation if hasattr(p, "scriptLocation") else None)
            version_table_schema = config.get("versionTableSchema") or (p.versionTableSchema if hasattr(p, "versionTableSchema") else None)
            auto_upgrade = (
                config.get("autoUpgrade")
                if type(config.get("autoUpgrade")) == bool
                else (p.autoUpgrade if hasattr(p, "autoUpgrade") and type(p.autoUpgrade) == bool else auto_upgrade_default)
            )

            # Validate the plugin description
            missing_fields = []
            if not id:
                missing_fields.append("id")
            if not script_location:
                missing_fields.append("scriptLocation")
            if not db_key and not db_url:
                missing_fields.append("dbUrl or dbKey")

            if len(missing_fields) > 0:
                _log.error(
                    "No {} defined for DBMigration {} - is your configuration up to date?".format(
                        ", ".join(missing_fields), id or "<UNKNOWN>"
                    )
                )
                continue

            if db_key and db_url:
                _log.info(f"Both dbKey and dbUrl defined for DBMigration {id} - falling back to dbUrl")
            elif db_key:
                # Check if engine exists
                if db_key not in manager.db.connectors:
                    _log.error(f"No engine called {db_key} found for DBMigration {id} - is your configuration up to date?")
                    continue

                # Retrieve engine and store string as db url
                try:
                    db_url = str(manager.db.engine(db_key).url)
                except Exception:
                    _log.exception(f"Error retrieving URL from engine {db_key}")
                    continue

            # Create new migration
            migration = DBMigration(
                id,  # type: ignore
                db_url,  # type: ignore
                script_location,  # type: ignore
                auto_upgrade=auto_upgrade,  # type: ignore
                version_table_schema=version_table_schema,
            )

            # Store migration
            self._migrations[migration.id] = migration

    def __contains__(self, item):
        return item in self._migrations

    def __getitem__(self, item):
        if item not in self:
            raise NotImplementedError("Missing DBMigration: " + item)
        return self._migrations[item]

    def __len__(self):
        return len(self._migrations)

    @property
    def ids(self) -> list[str]:
        return list(self._migrations.keys())

    @property
    def migrations(self) -> list[DBMigration]:
        return list(self._migrations.values())


def create_migration_command(parser):
    """
    Creates a migration command used by the 'command' extension point.
    """
    subparsers = parser.add_subparsers(dest="action", required=True)

    subparsers.add_parser("list", help="List all available migrations")

    command_parser = subparsers.add_parser("exec", help="Execute command on migration(s)")

    # Either require individual ids or all flag
    command_parser.add_argument(
        "id",
        choices=manager.db_migration.ids + ["all"],
        help="ID of the migration, or all of them",
    )

    command_parser.add_argument("command", nargs=REMAINDER, help="Command executed by the migration")

    def execute(args):
        if args.action == "list":
            if len(manager.db_migration) == 0:
                _log.info("No migrations found")
            else:
                _log.info("Available migrations: {}".format(", ".join(str(migration) for migration in manager.db_migration.migrations)))
        elif args.action == "exec":
            if args.id == "all":
                # TODO
                _log.info(
                    "Currently, only single migrations are supported. Please execute the command for each migration individually as we are working on a fix."
                )
                return

            # Using REMAINDER as nargs causes the argument to be be optional, but '+' does not work because it also parses additional --attr with the parser which should actually be ignored.
            # Therefore, args.command might be empty and we simply pass None to trigger the error message
            manager.db_migration[args.id].execute(args.command if len(args.command) > 0 else None)  # type: ignore

    return lambda args: lambda: execute(args)
