import abc
from builtins import object

from ... import manager
from ..dataset_def import ADataSetEntry


class GraphNode(object):
    def __init__(self, t, id, attrs=None):
        self.type = t
        self.id = id
        self.attrs = {} if attrs is None else attrs

    def asjson(self):
        return dict(type=self.type, id=self.id, attrs=self.attrs)


class GraphEdge(object):
    def __init__(self, t, id, source=None, target=None, attrs=None):
        self.type = t
        self.id = id
        self.source = source
        self.target = target
        self.attrs = {} if attrs is None else attrs

    def asjson(self):
        return dict(
            type=self.type,
            id=self.id,
            source=self.source,
            target=self.target,
            attrs=self.attrs,
        )


class AGraph(ADataSetEntry, metaclass=abc.ABCMeta):
    def __init__(self, name, project, id=None, attrs=None):
        super(AGraph, self).__init__(name, project, "graph", id)
        self.attrs = {} if attrs is None else attrs

    @abc.abstractmethod
    def nodes(self):
        return []

    @property
    def nnodes(self):
        return len(self.nodes())

    @abc.abstractmethod
    def edges(self):
        return []

    @property
    def nedges(self):
        return len(self.edges())

    def to_description(self):
        r = super(AGraph, self).to_description()
        r["size"] = [self.nnodes, self.nedges]
        r["attrs"] = self.attrs
        return r

    def asjson(self):
        nodes = [a.asjson() for a in self.nodes()]
        edges = [a.asjson() for a in self.edges()]

        r = dict(nodes=nodes, edges=edges)
        return r

    def add_node(self, data):
        return False

    def update_node(self, data):
        return False

    def get_node(self, id):
        return next((n for n in self.nodes() if n.id == id), None)

    def remove_node(self, id):
        return False

    def add_edge(self, data):
        return False

    def get_edge(self, id):
        return next((n for n in self.edges() if n.id == id), None)

    def update_edge(self, data):
        return False

    def remove_edge(self, id):
        return False

    def clear(self):
        return False

    def incoming_edges(self, node):
        return (e for e in self.edges() if e.target == node.id)

    def outgoing_edges(self, node):
        return (e for e in self.edges() if e.source == node.id)

    def resolve_edges(self, edges):
        to_find = set()
        edges = list(edges)
        for e in edges:
            to_find.add(e.source)
            to_find.add(e.target)
        n = {n.id: n for n in self.nodes() if n.id in to_find}
        return ((e, n[e.source], n[e.target]) for e in edges)


def _resolve_parser(format):
    for p in manager.registry.list("graph-parser"):
        if p.format == format:  # type: ignore
            return p.load()


def _guess_format(format_field, files):
    if format_field:
        return format_field

    if len(files) > 0:
        # use the file extension as a hint
        import os.path

        fn = files[0].filename
        name, ext = os.path.splitext(fn)
        return ext.lower()
    return "json"  # default


def parse(args, files):
    format = _guess_format(args.get("format", None), files)
    formatter = _resolve_parser(format)
    if formatter:
        return formatter.factory(args, files)
    return None
