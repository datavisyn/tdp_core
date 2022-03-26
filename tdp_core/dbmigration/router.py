import logging

from flask import Flask, abort, jsonify

from ..security import login_required
from .manager import DBMigration, db_migration_manager

__author__ = "Datavisyn"
_log = logging.getLogger(__name__)

app = Flask(__name__)


def _get_migration_by_id(id: str) -> DBMigration:
    if id not in db_migration_manager():
        abort(404, "No migration with id {} found".format(id))
    return db_migration_manager()[id]


@app.route("/")
@login_required
def list_migrations():
    return jsonify([migration.id for migration in db_migration_manager().migrations]), 200


@app.route("/<string:id>")
@login_required
def list_migration(id):
    return jsonify(_get_migration_by_id(id).id), 200


def create_migration_api():
    return app
