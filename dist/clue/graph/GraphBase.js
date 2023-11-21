import { GraphNode, GraphEdge, AGraph } from './graph';
export class GraphFactoryUtils {
}
GraphFactoryUtils.defaultGraphFactory = {
    makeNode: (p) => new GraphNode().restore(p),
    makeEdge: (p, lookup) => new GraphEdge().restore(p, lookup),
};
export class GraphBase extends AGraph {
    constructor(desc, nodes = [], edges = []) {
        super();
        this.desc = desc;
        this._nodes = nodes;
        this._edges = edges;
    }
    get nodes() {
        return this._nodes;
    }
    get edges() {
        return this._edges;
    }
    /**
     * migrate one graph to another cleaning this graph returning node references
     * @returns {{nodes: GraphNode[]; edges: GraphEdge[]}}
     */
    migrate() {
        return {
            nodes: this.nodes,
            edges: this.edges,
        };
    }
    addNode(n) {
        this.nodes.push(n);
        this.fire('add_node', n);
        return this;
    }
    updateNode(n) {
        // since we store a reference we don't need to do anything
        this.fire('update_node', n);
        return this;
    }
    removeNode(n) {
        const i = this.nodes.indexOf(n);
        if (i < 0) {
            return null;
        }
        this.nodes.splice(i, 1);
        this.fire('remove_node', n);
        return this;
    }
    addEdge(edgeOrSource, type, t) {
        if (edgeOrSource instanceof GraphEdge) {
            const e = edgeOrSource;
            this.edges.push(e);
            this.fire('add_edge', e, e.type, e.source, e.target);
            return this;
        }
        return this.addEdge(new GraphEdge(type, edgeOrSource, t));
    }
    updateEdge(e) {
        // since we store a reference we don't need to do anything
        this.fire('update_edge', e);
        return this;
    }
    removeEdge(e) {
        const i = this.edges.indexOf(e);
        if (i < 0) {
            return null;
        }
        e.takeDown();
        this.edges.splice(i, 1);
        this.fire('remove_edge', e);
        return this;
    }
    clear() {
        this.nodes.splice(0, this.nodes.length);
        this.edges.splice(0, this.edges.length);
        return Promise.resolve(this);
    }
    persist() {
        return {
            root: this.desc.id,
            nodes: this.nodes.map((s) => s.persist()),
            edges: this.edges.map((l) => l.persist()),
        };
    }
    restore(dump) {
        return this;
    }
}
//# sourceMappingURL=GraphBase.js.map