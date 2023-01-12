import json
import logging
from collections import OrderedDict
from typing import Any

from flask import Flask, render_template
from flask.wrappers import Response
from jinja2 import Template

from . import db, manager
from .utils import secure_replacements

_log = logging.getLogger(__name__)
app = Flask("flask_swagger_ui", static_folder="dist", template_folder="templates")


def _gen():
    from os import path

    from yaml import safe_load
    from yamlreader import data_merge, yaml_load

    here = path.abspath(path.dirname(__file__))

    files = [path.join(here, "swagger", p) for p in ["swagger.yml", "db.yml"]]  # , 'proxy.yml', 'storage.yml']]
    base: dict[str, Any] = yaml_load(files)  # type: ignore
    base["paths"] = OrderedDict(sorted(base["paths"].items(), key=lambda t: t[0]))

    with open(path.join(here, "swagger", "view.tmpl.yml"), encoding="utf-8") as f:
        template = Template(str(f.read()))

    tags = base["tags"]

    def to_type(t):
        if t is None:
            return "string"
        if t is int:
            return "integer"
        if t is float:
            return "number"

    # integrate all views using the template
    for database, connector in manager.db.connectors.items():

        db.resolve(database)  # trigger filling up columns

        # add database tag
        tags.append({"name": "db_" + database, "description": connector.description or ""})

        for view, dbview in connector.views.items():
            if not dbview.can_access() or dbview.query_type == "private":
                continue
            # if database != u'dummy' or view != u'b_items_verify':
            #  continue

            for tag in dbview.tags:
                if tag not in tags:
                    tags.append(tag)

            args = []
            for arg in dbview.arguments:
                info = dbview.get_argument_info(arg)
                args.append(
                    {
                        "name": arg,
                        "type": to_type(info.type),
                        "as_list": info.as_list,
                        "enum_values": None,
                        "description": info.description,
                        "example": info.example,
                    }
                )

            for arg in (a for a in dbview.replacements if a not in secure_replacements):
                extra = dbview.valid_replacements.get(arg)
                arg_type = "string"
                enum_values = None
                if isinstance(extra, list):
                    enum_values = extra
                if extra in (int, float):
                    arg_type = to_type(extra)
                args.append(
                    {
                        "name": arg,
                        "type": arg_type,
                        "as_list": False,
                        "enum": enum_values,
                        "description": "",
                    }
                )

            filters = set()

            if "where" in dbview.replacements or "and_where" in dbview.replacements:
                # filter possible
                for k in dbview.filters:
                    filters.add(k)
                if not filters:
                    for k in list(dbview.columns.keys()):
                        filters.add(k)

            if "agg_score" in dbview.replacements:
                # score query magic handling
                agg_score = connector.agg_score
                args.append(
                    {
                        "name": "agg",
                        "type": "string",
                        "as_list": False,
                        "enum": agg_score.valid_replacements.get("agg"),
                    }
                )

            props = []
            for k, prop in dbview.columns.items():
                p = prop.copy()
                p["name"] = k
                if "type" not in p or p["type"] == "categorical":
                    p["type"] = "string"
                props.append(p)

            if dbview.idtype:
                # assume when id type given then we have ids
                props.append({"name": "_id", "type": "integer"})
                if not any((p["name"] == "id" for p in props)):
                    props.append({"name": "id", "type": "string"})

            features = {
                "generic": dbview.query_type in ["generic", "helper", "table"],
                "desc": dbview.query_type in ["table"],
                "lookup": dbview.query_type in ["lookup"],
                "score": dbview.query_type in ["score"],
            }

            keys = {
                "database": database,
                "view": view,
                "type": dbview.query_type,
                "description": dbview.description or "",
                "summary": dbview.summary or "",
                "args": args,
                "empty": not args and not filters,
                "filters": filters,
                "features": features,
                "tags": dbview.tags or [],
                "props": props,
                "propsempty": not props,
            }

            view_yaml = template.render(**keys)
            # _log.info(view_yaml)
            part = safe_load(view_yaml)
            base = data_merge(base, part)  # type: ignore

    # post process using extensions
    for p in manager.registry.list("tdp-swagger-postprocessor"):
        base = p.load().factory(base)

    return base


@app.route("/swagger.yaml")
def _generate_swagger_yml():
    from yaml import dump

    return Response(dump(_gen()), mimetype="text/vnd.yaml")


@app.route("/swagger.json")
def _generate_swagger_json():
    return Response(json.dumps(_gen()), mimetype="application/json")


@app.route("/")
@app.route("/<path:path>")
def show(path=None):
    if not path or path == "index.html":
        fields = {
            # Some fields are used directly in template
            "base_url": ".",
            "app_name": "Target Discovery Platform API",
            # Rest are just serialized into json string for inclusion in the .js file
            "config_json": json.dumps(
                {
                    "app_name": "Swagger UI",
                    "dom_id": "#swagger-ui",
                    "url": "./swagger.json",
                    "layout": "StandaloneLayout",
                }
            ),
        }
        return render_template("index.template.html", **fields)
    return app.send_static_file(path)


def create():
    return app
