import logging

from flask import Flask, abort, jsonify
from ..security import login_required
from .manager import get_db_migration_manager, DBMigration


__author__ = "Datavisyn"
_log = logging.getLogger(__name__)

app = Flask(__name__)


def _get_migration_by_id(id: str) -> DBMigration:
    if id not in get_db_migration_manager():
        abort(404, "No migration with id {} found".format(id))
    return get_db_migration_manager()[id]


@app.route("/")
@login_required
def list_migrations():
    return jsonify([migration.id for migration in get_db_migration_manager().migrations]), 200


@app.route("/<string:id>")
@login_required
def list_migration(id):
    return jsonify(_get_migration_by_id(id).id), 200


def create_migration_api():
    return app
