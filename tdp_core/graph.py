from . import manager
from .dataset.dataset_def import ADataSetProvider
from .dataset.graph import graph
from .utils import fix_id, random_id


class MongoGraph(graph.AGraph):
    def __init__(self, entry, db):
        super(MongoGraph, self).__init__(entry["name"], "mongodb", entry.get("id", None), entry.get("attrs", None))
        self._entry = entry
        self._db = db
        from bson.objectid import ObjectId

        self._find_me = dict(_id=self._entry["_id"])
        self._find_data = dict(_id=ObjectId(self._entry["refid"]))

        self._nodes = None
        self._edges = None

    @staticmethod
    def list(db):
        return [MongoGraph(entry, db) for entry in db.graph.find()]

    @staticmethod
    def create(data, user, id, db):
        # if 'clone_from' in data:
        #  #clone from an existing graph
        #  from bson.objectid import ObjectId
        #  other_desc = db.graph.find_one(dict(_id=data['clone_from']))
        #  other_data = db.graph_data.find_one(dict(_id=ObjectId(other_desc['refid'])))
        # else
        #  other_desc = dict()
        #  other_data = dict()

        import datetime

        entry: dict[str, int | datetime.datetime | str] = dict(
            name=data["name"],
            description=data.get("description", ""),
            creator=user.name,
            nnodes=len(data["nodes"]),
            nedges=len(data["edges"]),
            attrs=data.get("attrs", {}),
            ts=datetime.datetime.utcnow(),
        )

        if "group" in data:
            entry["group"] = data["group"]
        if "permissions" in data:
            entry["permissions"] = data["permissions"]
        if "buddies" in data:
            entry["buddies"] = data["buddies"]
        if id is not None:
            entry["id"] = id

        data_entry = dict(nodes=data["nodes"], edges=data["edges"])
        data_id = db.graph_data.insert_one(data_entry).inserted_id

        entry["refid"] = str(data_id)
        db.graph.insert_one(entry)

        return MongoGraph(entry, db)

    def nodes(self):
        if self._nodes is None:
            data = self._db.graph_data.find_one(self._find_data, {"nodes": 1})
            self._nodes = [graph.GraphNode(n["type"], n["id"], n.get("attrs", None)) for n in data["nodes"]]

        return self._nodes

    @property
    def nnodes(self):
        return self._entry["nnodes"]

    def edges(self):
        if self._edges is None:
            data = self._db.graph_data.find_one(self._find_data, {"edges": 1})
            self._edges = [graph.GraphEdge(n["type"], n["id"], n["source"], n["target"], n.get("attrs", None)) for n in data["edges"]]

        return self._edges

    @property
    def nedges(self):
        return self._entry["nedges"]

    def to_description(self):
        r = super(MongoGraph, self).to_description()

        if self._entry is not None:
            r["description"] = self._entry["description"]
            r["creator"] = self._entry["creator"]
            if "group" in self._entry:
                r["group"] = self._entry["group"]
            if "permissions" in self._entry:
                r["permissions"] = self._entry["permissions"]
            if "buddies" in self._entry:
                r["buddies"] = self._entry["buddies"]
            r["ts"] = self._entry["ts"]

        return r

    def add_node(self, data):
        if not self.can_write():
            return False
        self._db.graph.update(self._find_me, {"$inc": dict(nnodes=1)})
        self._db.graph_data.update(self._find_data, {"$push": dict(nodes=data)})
        self._entry["nnodes"] += 1
        if self._nodes:
            self._nodes.append(graph.GraphNode(data["type"], data["id"], data.get("attrs", None)))
        return True

    def update_node(self, data):
        if not self.can_write():
            return False
        q = self._find_data.copy()
        q["nodes.id"] = data["id"]
        self._db.graph_data.update(q, {"$set": {"nodes.$.attrs": data.get("attrs", {})}})
        # update({ "item.two" : "24" },
        #   { $set : { "item.$.two" : "" }}, false, true);
        if self._nodes:
            for n in self._nodes:
                if n.id == id:
                    n.attrs = data.get("attrs", {})
                    break

        return True

    def remove_node(self, id):
        if not self.can_write():
            return False
        if self._nodes:
            n = self.get_node(id)
            if n:
                self._nodes.remove(n)
        self._entry["nnodes"] -= 1
        # remove node and all associated edges
        self._db.graph_data.update(self._find_data, {"$pull": dict(nodes=dict(id=id))}, multi=False)

        self._db.graph_data.update(
            self._find_data,
            {"$pull": dict(edges={"$or": [dict(source=id), dict(target=id)]})},
            multi=True,
        )

        if self._edges:
            self._edges = [e for e in self._edges if e.source != id and e.target != id]
            self._entry["nedges"] = len(self._edges)
        else:
            # use a query to compute the length
            self._entry["nedges"] = len(self._db.graph_data.find_one(self._find_data, {"edges": 1})["edges"])
        self._db.graph.update(
            self._find_me,
            {"$inc": dict(nnodes=-1), "$set": dict(nedges=self._entry["nedges"])},
        )

        return True

    def get_node(self, id):
        for n in self.nodes():
            if n.id == id:
                return n
        return None

    def get_edge(self, id):
        for n in self.edges():
            if n.id == id:
                return n
        return None

    def clear(self):
        if not self.can_write():
            return False
        self._db.graph.update(self._find_me, {"$set": dict(nnodes=0, nedges=0)})
        self._db.graph_data.update(self._find_data, {"$set": dict(nodes=[], edges=[])})
        self._nodes = None
        self._edges = None
        self._entry["nnodes"] = 0
        self._entry["nedges"] = 0
        return True

    def add_edge(self, data):
        if not self.can_write():
            return False
        self._db.graph.update(self._find_me, {"$inc": dict(nedges=1)})
        self._db.graph_data.update(self._find_data, {"$push": dict(edges=data)})
        self._entry["nedges"] += 1
        if self._edges:
            self._edges.append(
                graph.GraphEdge(
                    data["type"],
                    data["id"],
                    data["source"],
                    data["target"],
                    data.get("attrs", None),
                )
            )
        return True

    def update_edge(self, data):
        if not self.can_write():
            return False
        q = self._find_data.copy()
        q["edges.id"] = data["id"]
        self._db.graph_data.update(q, {"$set": {"edges.$.attrs": data.get("attrs", {})}})
        # update({ "item.two" : "24" },
        #   { $set : { "item.$.two" : "" }}, false, true);
        if self._edges:
            for n in self._edges:
                if n.id == id:
                    n.attrs = data.get("attrs", {})
                    break

        return True

    def remove_edge(self, id):
        if not self.can_write():
            return False
        if self._edges:
            n = self.get_edge(id)
            if n:
                self._edges.remove(n)
        self._entry["nedges"] -= 1
        self._db.graph.update(self._find_me, {"$inc": dict(nedges=-1)})
        self._db.graph_data.update(self._find_data, {"$pull": dict(edges=dict(id=id))})
        return True

    def remove(self):
        if not self.can_write():
            return False
        self._db.graph.remove(self._find_me)
        self._db.graph_data.remove(self._find_data)
        self._nodes = None
        self._edges = None
        self._entry["nnodes"] = 0
        self._entry["nedges"] = 0
        return True

    def modify(self, args, files):
        if not self.can_write():
            return False
        op = args.get("operation", "setmetadata")
        if op == "setmetadata":
            changes = {}
            for key in [
                "name",
                "description",
                "group",
                "permissions",
                "buddies",
                "attrs",
            ]:
                if key in args:
                    self._entry[key] = changes[key] = args[key]
            self.name = self._entry["name"]
            self._db.graph.update(self._find_me, {"$set": changes}, upsert=False)
            return True
        elif op == "batch":
            items = args.get("items", [])
            for item in items:
                item_type = item["type"]
                item_op = item["op"]
                item_id = item.get("id", None)
                item_desc = item.get("desc", None)
                if op == "remove":
                    if not getattr(self, "remove_" + item_type)(item_id):
                        return False
                else:
                    if not getattr(self, item_op + "_" + item_type)(item_desc):
                        return False
            return True
        return False


def _generate_id(basename):
    return fix_id(basename + " " + random_id(5))


class GraphProvider(ADataSetProvider):
    def __init__(self):
        from pymongo import MongoClient

        c = manager.settings.tdp_core.mongo

        self.client = MongoClient(c.host, c.port)
        self.db = self.client[c.db_graph]

    def __iter__(self):
        return iter((f for f in MongoGraph.list(self.db) if f.can_read()))

    def remove(self, entry):
        if isinstance(entry, MongoGraph) and entry.can_write() and entry.remove():
            return True
        return False

    def upload(self, data, files, id=None):
        if not data.get("type", "unknown") == "graph":
            return None  # can't handle
        from tdp_core.security import current_user

        user = current_user()

        parsed = graph.parse(data, files)

        if parsed is None:
            return None

        if id is None:
            id = _generate_id(parsed.get("name", ""))

        return MongoGraph.create(parsed, user, id, self.db)


def create():
    return GraphProvider()


# CLEAR DB:
# bash: mongo:
# use graph;
# db.dropDatabase();
