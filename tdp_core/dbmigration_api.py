import logging

from phovea_server.ns import Namespace, abort
from .security import tdp_login_required
from phovea_server.util import jsonify
from .dbmigration import get_db_migration_manager, DBMigration, DBMigrationManager


__author__ = 'Datavisyn'
_log = logging.getLogger(__name__)

app = Namespace(__name__)


class DBMigrationEncoder(object):
  """
  JSON encoder for DBMigrationManager and DBMigration objects.
  """
  def __contains__(self, obj):
    return isinstance(obj, DBMigrationManager) or isinstance(obj, DBMigration)

  def __call__(self, obj, base_encoder):
    if isinstance(obj, DBMigrationManager):
      return obj.migrations
    if isinstance(obj, DBMigration):
      return obj.__dict__


# Global migration encoder
db_migration_encoder = DBMigrationEncoder()


def create_migration_encoder():
  return db_migration_encoder


def _get_migration_by_id(id: str) -> DBMigration:
  if id not in get_db_migration_manager():
    abort(404, 'No migration with id {} found'.format(id))
  return get_db_migration_manager()[id]


@app.route('/')
@tdp_login_required
def list_migrations():
  return jsonify(get_db_migration_manager()), 200


@app.route('/<string:id>')
@tdp_login_required
def list_migration(id):
  return jsonify(_get_migration_by_id(id)), 200


def create_migration_api():
  return app
