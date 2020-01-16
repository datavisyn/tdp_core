import logging

from phovea_server.config import view as configview
from phovea_server.plugin import list as list_plugins
from .db import configs as engines
from typing import List, Dict, Optional
import alembic.command
import alembic.config
from os import path
from argparse import REMAINDER, ArgumentTypeError


__author__ = 'Datavisyn'
_log = logging.getLogger(__name__)
alembic_cfg = alembic.config.Config(path.join(path.abspath(path.dirname(__file__)), 'dbmigration.ini'))


class DBMigration(object):
  """
  DBMigration object stores the required arguments to execute commands using Alembic.
  """

  def __init__(self, id: str, db_key: str, script_location: str, auto_upgrade: bool=False):
    """
    Initializes a new migration object and optionally carries out an upgrade.
    :param str id: ID of the migration object
    :param str db_key: Key of the engine (coming from tdp_core#db)
    :param str script_location: Location of the base directory (containing env.py and the versions directory)
    :param bool auto_upgrade: True if the migration should automatically upgrade the database to head
    """
    self.id: str = id
    self.db_key: str = db_key
    self.script_location: str = script_location
    self.auto_upgrade: bool = auto_upgrade

    missing_fields = []
    if not self.id:
      missing_fields.append('id')
    if not self.script_location:
      missing_fields.append('scriptLocation')
    if not self.db_key:
      missing_fields.append('dbKey')

    if len(missing_fields) > 0:
      raise ValueError('No {} defined for DBMigration {} - is your configuration up to date?'.format(', '.join(missing_fields), self.id))

    # Automatically upgrade to head (if enabled)
    if self.auto_upgrade:
      _log.info('Upgrading database {}'.format(self.id))
      self.execute(['upgrade', 'head'])

  def execute(self, arguments: List[str]) -> bool:
    """
    Executes a command on the migration object.
    :param List[str] arguments: Arguments for the underlying Alembic instance. See https://alembic.sqlalchemy.org/en/latest/api/ for details.

    Example usage: migration.execute(['upgrade', 'head']) upgrades to the database to head.
    """
    # Check if engine exists
    if self.db_key not in engines:
      raise ValueError('No engine called {} found for DBMigration {} - aborting migration'.format(self.db_key, self.id))

    # Setup an alembic command line parser to parse the arguments
    cmd_parser = alembic.config.CommandLine()

    # Parse the options (incl. validation)
    options = cmd_parser.parser.parse_args(arguments)

    # Retrieve engine
    engine = engines.engine(self.db_key)

    # Inject options in the configuration object
    alembic_cfg.cmd_opts = options
    alembic_cfg.set_main_option('script_location', self.script_location)
    alembic_cfg.set_main_option('sqlalchemy.url', str(engine.url))
    alembic_cfg.set_main_option('migration_id', self.db_key)

    # Run the command
    cmd_parser.run_cmd(alembic_cfg, options)

    return True


class DBMigrationManager(object):
  """
  DBMigrationManager retrieves all 'tdp-sql-database-migration' plugins and initializes DBMigration objects.
  The possible configuration keys for this extension point are:
   - configKey: Key of the configuration entry (i.e. <app_name>.migration)
   - id: ID of the migration for logging purposes (passed to DBManager)
   - dbKey: Key of the engine used for the migration (passed to DBManager)
   - scriptLocation: Location of the alembic root folder (passed to DBManager)
   - autoUpgrade: Flag which auto-upgrades to the latest revision (passed to DBManager)

  The keys are retrieved from the following sources (in order):
   - File configuration at configKey
   - Plugin configuration
  """

  def __init__(self):
    self._initialized: bool = False
    self._migrations: Dict[str, DBMigration] = dict()

    _log.info("Initializing DBMigrationManager")

    for p in list_plugins('tdp-sql-database-migration'):
      _log.info("DBMigration found: %s", p.id)

      # Check if configKey is set, otherwise use the plugin configuration
      config = configview(p.configKey) if p.configKey else {}

      # Priority of assignments: Configuration File -> Plugin Definition
      id = config.get('id') or (p.id if hasattr(p, 'id') else None)
      script_location = config.get('scriptLocation') or (p.scriptLocation if hasattr(p, 'scriptLocation') else None)
      db_key = config.get('dbKey') or (p.dbKey if hasattr(p, 'dbKey') else None)
      auto_upgrade = config.get('autoUpgrade') if type(config.get('autoUpgrade')) == bool else \
          (p.autoUpgrade if hasattr(p, 'autoUpgrade') and type(p.autoUpgrade) == bool else None)

      # Create new migration
      migration = DBMigration(id, db_key, script_location, auto_upgrade)

      # Store migration
      self._migrations[migration.id] = migration

  def get_migration(self, id: str) -> Optional[DBMigration]:
    return self._migrations.get(id)

  def get_available_migrations(self) -> List[str]:
    return list(self._migrations.keys())


# Global migration manager
db_migration_manager = DBMigrationManager()


def parse_migration(value: str) -> DBMigration:
  """
  Parses a value by retrieving the DBMigration instance from the db_migration_manager.
  """
  possible_values = db_migration_manager.get_available_migrations()
  if len(possible_values) == 0:
    raise ArgumentTypeError("No migrations available")
  if value not in possible_values:
    raise ArgumentTypeError("Must be one of the following options: {}".format(', '.join(possible_values)))
  return db_migration_manager.get_migration(value)


def create_migration_command(parser):
  """
  Creates a new command used by the 'command' extension point.
  """
  parser.add_argument('migration',
                      type=parse_migration,
                      help='ID of the migration defined in the registry')

  parser.add_argument('migration_parameters',
                      nargs=REMAINDER,
                      help='Parameters passed to the execution of the migration')

  return lambda args: lambda: args.migration.execute(args.migration_parameters)
