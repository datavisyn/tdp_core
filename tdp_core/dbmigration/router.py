import logging

from flask import Flask, abort, jsonify

from .. import manager
from ..security import login_required
from .manager import DBMigration

__author__ = "Datavisyn"
_log = logging.getLogger(__name__)

app = Flask(__name__)


def _get_migration_by_id(id: str) -> DBMigration:
    if id not in manager.db_migration:
        abort(404, "No migration with id {} found".format(id))
    return manager.db_migration[id]


@app.route("/")
@login_required
def list_migrations():
    return jsonify([migration.id for migration in manager.db_migration.migrations]), 200


@app.route("/<string:id>")
@login_required
def list_migration(id):
    return jsonify(_get_migration_by_id(id).id), 200


def create_migration_api():
    return app
