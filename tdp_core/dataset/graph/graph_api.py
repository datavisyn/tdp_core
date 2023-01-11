from flask import abort, jsonify, request

from ... import manager


def _to_desc():
    if "desc" in request.values:
        import json

        n = json.loads(request.values["desc"])
    else:
        n = request.values
    return n


def format_json(dataset, args):
    d = dataset.asjson()
    if bool(args.get("f_pretty_print", False)):
        return jsonify(d, indent=" ")
    return jsonify(d)


def resolve_formatter(type, format):
    for p in manager.registry.list(type + "-formatter"):
        if p.format == format:  # type: ignore
            return p.load()
    formats = ",".join(p.format for p in manager.registry.list(type + "-formatter"))  # type: ignore
    abort(400, 'unknown format "{}" possible formats are: {}'.format(format, formats))


def _list_items(dataset_getter, name, datasetid):
    d = dataset_getter(datasetid, "graph")
    if request.method == "GET":
        return jsonify([n.asjson() for n in getattr(d, name + "s")()])

    if request.method == "DELETE":
        if not d.can_write():
            abort(403)
        if d.clear():
            return jsonify(d.to_description(), indent=1)
        abort(400)

    # post
    if not d.can_write():
        abort(403)
    n = _to_desc()
    if getattr(d, "add_" + name)(n):
        return jsonify(d.to_description(), indent=1)
    # invalid upload
    abort(400)


def _handle_item(dataset_getter, name, datasetid, itemid):
    d = dataset_getter(datasetid, "graph")
    if request.method == "GET":
        n = getattr(d, "get_" + name)(itemid)
        return jsonify(n.asjson())

    if request.method == "DELETE":
        if not d.can_write():
            abort(403)
        if getattr(d, "remove_" + name)(itemid):
            return jsonify(d.to_description(), indent=1)
        abort(400)

    # put
    if not d.can_write():
        abort(403)
    n = _to_desc()
    n["id"] = itemid
    if getattr(d, "update_" + name)(n):
        return jsonify(d.to_description(), indent=1)
    # invalid upload
    abort(400)


def _list_type(dataset_getter, name="node"):
    def listitem(datasetid):
        return _list_items(dataset_getter, name, datasetid)

    def handleitem(datasetid, itemid):
        return _handle_item(dataset_getter, name, datasetid, itemid)

    return listitem, handleitem


def add_graph_handler(app, dataset_getter):
    @app.route("/graph/<datasetid>")
    def list_graphs(datasetid):
        d = dataset_getter(datasetid, "graph")
        return jsonify(d.to_description())

    @app.route("/graph/<datasetid>/data")
    def get_graph_data(datasetid):
        d = dataset_getter(datasetid, "graph")
        formatter = resolve_formatter("graph", request.args.get("format", "json"))
        return formatter(d, args=request.args)

    list_nodes, handle_node = _list_type(dataset_getter, "node")
    app.add_url_rule(
        "/graph/<datasetid>/node",
        "list_nodes",
        list_nodes,
        methods=["GET", "POST", "DELETE"],
    )
    app.add_url_rule(
        "/graph/<datasetid>/node/<int:itemid>",
        "handle_node",
        handle_node,
        methods=["GET", "PUT", "DELETE"],
    )

    list_edges, handle_edge = _list_type(dataset_getter, "edge")
    app.add_url_rule(
        "/graph/<datasetid>/edge",
        "list_edges",
        list_edges,
        methods=["GET", "POST", "DELETE"],
    )
    app.add_url_rule(
        "/graph/<datasetid>/edge/<int:itemid>",
        "handle_edge",
        handle_edge,
        methods=["GET", "PUT", "DELETE"],
    )

    # websocket = ws.Socket(app)
    # @websocket.route('/ws')
    # def graph_ws(socket):
    #  ws.websocket_loop(socket, dict(get_graph=(payload, s)))
