import logging

from phovea_server.config import view as configview
from phovea_server.plugin import list as list_plugins
from .db import configs as engines
from typing import List, Dict
import alembic.command
import alembic.config
from os import path
from argparse import REMAINDER


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
      raise ValueError('No {} defined for DBMigration {} - is your configuration up to date?'.format(', '.join(missing_fields), self.id or '<UNKNOWN>'))

    # Automatically upgrade to head (if enabled)
    if self.auto_upgrade:
      _log.info('Upgrading database {}'.format(self.id))
      self.execute(['upgrade', 'head'])

  def __repr__(self) -> str:
    return f'DBMigration({self.id})'

  def __str__(self) -> str:
    return self.id

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
    alembic_cfg.set_main_option('migration_id', self.id)

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
    self._migrations: Dict[str, DBMigration] = dict()

    _log.info('Initializing DBMigrationManager')

    for p in list_plugins('tdp-sql-database-migration'):
      _log.info('DBMigration found: %s', p.id)

      # Check if configKey is set, otherwise use the plugin configuration
      config = configview(p.configKey) if hasattr(p, 'configKey') else {}

      # Priority of assignments: Configuration File -> Plugin Definition
      id = config.get('id') or (p.id if hasattr(p, 'id') else None)
      db_key = config.get('dbKey') or (p.dbKey if hasattr(p, 'dbKey') else None)
      script_location = config.get('scriptLocation') or (p.scriptLocation if hasattr(p, 'scriptLocation') else None)
      auto_upgrade = config.get('autoUpgrade') if type(config.get('autoUpgrade')) == bool else \
          (p.autoUpgrade if hasattr(p, 'autoUpgrade') and type(p.autoUpgrade) == bool else False)

      # Create new migration
      migration = DBMigration(id, db_key, script_location, auto_upgrade)

      # Store migration
      self._migrations[migration.id] = migration

  def __contains__(self, item):
    return item in self._migrations

  def __getitem__(self, item):
    if item not in self:
      raise NotImplementedError('missing db migration: ' + item)
    return self._migrations[item]

  def __len__(self):
    return len(self._migrations)

  @property
  def ids(self) -> List[str]:
    return list(self._migrations.keys())

  @property
  def migrations(self) -> List[DBMigration]:
    return list(self._migrations.values())


# Global migration manager
db_migration_manager = DBMigrationManager()


def create_migration_command(parser):
  """
  Creates a migration command used by the 'command' extension point.
  """
  # Either require individual ids or all flag

  subparsers = parser.add_subparsers(dest='action', required=True)

  subparsers.add_parser('list', help='List all available migrations')

  command_parser = subparsers.add_parser('exec', help='Execute command on migration(s)')

  command_parser.add_argument('id',
                              choices=db_migration_manager.ids + ['all'],
                              help='ID of the migration, or all of them')

  command_parser.add_argument('command',
                              nargs=REMAINDER,
                              help='Command executed by the migration')

  def execute(args):
    if args.action == 'list':
      if(len(db_migration_manager) == 0):
        print('No migrations found')
      else:
        print('Available migrations: {}'.format(', '.join(str(migration) for migration in db_migration_manager.migrations)))
    elif args.action == 'exec':
      if args.id == 'all':
        # TODO: For some reason, the migrations can only be executed for a single id.
        # When using multiple ids, alembic doesn't do anything in the 2nd, 3rd, ... migration.
        print('Currently, only single migrations are supported. Please execute the command for each migration individually as we are working on a fix.')
        return

      # Using REMAINDER as nargs causes the argument to be be optional, but '+' does not work because it also parses additional --attr with the parser which should actually be ignored.
      # Therefore, args.command might be empty and we simply pass None to trigger the error message
      db_migration_manager[args.id].execute(args.command if len(args.command) > 0 else None)

  return lambda args: lambda: execute(args)
