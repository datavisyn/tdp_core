import logging

import visyn_core.security as security
from flask import Flask, abort, jsonify, request
from pymongo import MongoClient
from pymongo.collection import ReturnDocument

from .settings import get_settings
from .utils import fix_id, random_id

c = get_settings().mongo
_log = logging.getLogger(__name__)

app = Flask(__name__)


@app.route("/namedsets/", methods=["GET", "POST"])  # type: ignore
def list_namedset():
    db = MongoClient(c.host, c.port)[c.db_namedsets]

    if request.method == "GET":
        q = {"idType": request.args["idType"]} if "idType" in request.args else {}
        return jsonify(([d for d in db.namedsets.find(q, {"_id": 0}) if security.can_read(d)]))

    if request.method == "POST":
        id = _generate_id()
        name = request.values.get("name", "NoName")
        creator = request.values.get("creator", security.current_username())
        permissions = int(request.values.get("permissions", security.DEFAULT_PERMISSION)) # type: ignore
        id_type = request.values.get("idType", "")
        ids = request.values.getlist("ids[]") or []
        description = request.values.get("description", "")
        sub_type_key = request.values.get("subTypeKey", "")
        sub_type_value = request.values.get("subTypeValue", "")
        type = int(request.values.get("type", "0")) # type: ignore
        entry = {
            "id": id,
            "name": name,
            "creator": creator,
            "permissions": permissions,
            "ids": ids,
            "idType": id_type,
            "description": description,
            "subTypeKey": sub_type_key,
            "subTypeValue": sub_type_value,
            "type": type,
        }
        db.namedsets.insert_one(entry)
        del entry["_id"]
        return jsonify(entry)


@app.route("/namedset/<namedset_id>", methods=["GET", "DELETE", "PUT"])  # type: ignore
def get_namedset(namedset_id):
    db = MongoClient(c.host, c.port)[c.db_namedsets]
    result = list(db.namedsets.find({"id": namedset_id}, {"_id": 0}))
    entry = result[0] if len(result) > 0 else None

    if not entry:
        abort(404, 'Namedset with id "{}" cannot be found'.format(namedset_id))

    if request.method == "GET":
        if not security.can_read(entry):
            abort(403, 'Namedset with id "{}" is protected'.format(namedset_id))
        return jsonify(entry)

    if request.method == "DELETE":
        if not security.can_write(entry):
            abort(403, 'Namedset with id "{}" is write protected'.format(namedset_id))
        q = {"id": namedset_id}
        result = db.namedsets.remove(q)
        return jsonify(result["n"])  # number of deleted documents

    if request.method == "PUT":
        if not security.can_write(entry):
            abort(403, 'Namedset with id "{}" is write protected'.format(namedset_id))
        filter = {"id": namedset_id}
        values = {}
        for key in ["name", "idType", "description", "subTypeKey", "subTypeValue"]:
            if key in request.form:
                values[key] = request.form[key]
        if "ids" in request.form:
            values["ids"] = request.form["ids"]
        for key in ["permissions", "type"]:
            if key in request.form:
                values[key] = int(request.form[key])
        query = {"$set": values}
        result = db.namedsets.find_one_and_update(filter, query, return_document=ReturnDocument.AFTER)
        del result["_id"]
        return jsonify(result)


def get_namedset_by_id(namedset_id):
    db = MongoClient(c.host, c.port)[c.db_namedsets]
    q = {"id": namedset_id}
    result = list(db.namedsets.find(q, {"_id": 0}))
    if not result:
        abort(404, 'Namedset with id "{}" cannot be found'.format(namedset_id))
    if not security.can_read(result[0]):
        abort(403, 'Namedset with id "{}" is protected'.format(namedset_id))

    return result[0]


def _generate_id():
    return fix_id(random_id(10))


@app.route("/attachment/", methods=["POST"])
def post_attachment():
    """
    simple attachment management
    :return:
    """
    db = MongoClient(c.host, c.port)[c.db_namedsets]

    id = _generate_id()
    # keep the encoded string
    creator = security.current_username()
    permissions = security.DEFAULT_PERMISSION

    entry = {"id": id, "creator": creator, "permissions": permissions, "data": request.data}
    db.attachments.insert_one(entry)
    return id


@app.route("/attachment/<attachment_id>", methods=["GET", "DELETE", "PUT"])  # type: ignore
def get_attachment(attachment_id):
    db = MongoClient(c.host, c.port)[c.db_namedsets]
    result = list(db.attachments.find({"id": attachment_id}, {"_id": 0}))
    entry = result[0] if len(result) > 0 else None

    if not entry:
        abort(404, 'Attachment with id "{}" cannot be found'.format(attachment_id))

    if request.method == "GET":
        if not security.can_read(entry):
            abort(403, 'Attachment with id "{}" is protected'.format(attachment_id))
        return entry["data"]

    if request.method == "DELETE":
        if not security.can_write(entry):
            abort(403, 'Attachment with id "{}" is write protected'.format(attachment_id))
        q = {"id": attachment_id}
        result = db.attachments.remove(q)
        return jsonify(result["n"])  # number of deleted documents

    if request.method == "PUT":
        if not security.can_write(entry):
            abort(403, 'Attachment with id "{}" is write protected'.format(attachment_id))
        filter = {"id": attachment_id}
        # keep the encoded string
        query = {"$set": {"data": request.data}}
        db.attachments.find_one_and_update(filter, query)
        return attachment_id


def create():
    """
    entry point of this plugin
    """
    return app


if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0")
