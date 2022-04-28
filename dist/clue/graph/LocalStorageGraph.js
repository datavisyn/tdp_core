import { GraphBase } from './GraphBase';
import { GraphEdge, GraphNode } from './graph';
export class LocalStorageGraph extends GraphBase {
    constructor(desc, nodes = [], edges = [], storage = sessionStorage) {
        super(desc, nodes, edges);
        this.updateHandler = (event) => {
            const s = event.target;
            if (s instanceof GraphNode) {
                this.updateNode(s);
            }
            if (s instanceof GraphEdge) {
                this.updateEdge(s);
            }
        };
        this.storage = storage;
        const { uid } = this;
        if (nodes.length > 0 || edges.length > 0) {
            this.storage.setItem(`${uid}.nodes`, JSON.stringify(nodes.map((d) => d.id)));
            nodes.forEach((n) => {
                this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
                n.on('setAttr', this.updateHandler);
            });
            this.storage.setItem(`${uid}.edges`, JSON.stringify(edges.map((d) => d.id)));
            edges.forEach((e) => {
                this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
                e.on('setAttr', this.updateHandler);
            });
        }
    }
    static migrate(graph, storage = sessionStorage) {
        return Promise.resolve(graph.migrate()).then(({ nodes, edges }) => {
            return new LocalStorageGraph(graph.desc, nodes, edges, storage);
        });
    }
    migrate() {
        this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
        this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
        return super.migrate();
    }
    static load(desc, factory, storage = sessionStorage, reset = false) {
        const r = new LocalStorageGraph(desc, [], [], storage);
        if (!reset) {
            r.load(factory);
        }
        return r;
    }
    static clone(graph, factory, storage = sessionStorage) {
        const r = new LocalStorageGraph(graph.desc, [], [], storage);
        r.restoreDump(graph.persist(), factory);
        return r;
    }
    get uid() {
        return `graph${this.desc.id}`;
    }
    load(factory) {
        const { uid } = this;
        if (this.storage.getItem(`${uid}.nodes`) == null) {
            return;
        }
        const nodeIds = JSON.parse(this.storage.getItem(`${uid}.nodes`));
        const lookup = new Map();
        nodeIds.forEach((id) => {
            const n = JSON.parse(this.storage.getItem(`${uid}.node.${id}`));
            const nn = factory.makeNode(n);
            lookup.set(nn.id, nn);
            nn.on('setAttr', this.updateHandler);
            super.addNode(nn);
        });
        const edgeIds = JSON.parse(this.storage.getItem(`${uid}.edges`));
        edgeIds.forEach((id) => {
            const n = JSON.parse(this.storage.getItem(`${uid}.edge.${id}`));
            const nn = factory.makeEdge(n, lookup.get.bind(lookup));
            nn.on('setAttr', this.updateHandler);
            super.addEdge(nn);
        });
        this.fire('loaded');
    }
    static delete(desc, storage = sessionStorage) {
        const uid = `graph${desc.id}`;
        JSON.parse(storage.getItem(`${uid}.nodes`) || '[]').forEach((id) => {
            storage.removeItem(`${uid}.node.${id}`);
        });
        storage.removeItem(`${uid}.nodes`);
        JSON.parse(storage.getItem(`${uid}.edges`) || '[]').forEach((id) => {
            storage.removeItem(`${uid}.edge.${id}`);
        });
        storage.removeItem(`${uid}.edges`);
        return true;
    }
    static update(desc, storage = sessionStorage) {
        const uid = `graph${desc.id}`;
    }
    restoreDump(persisted, factory) {
        const lookup = new Map();
        persisted.nodes.forEach((p) => {
            const n = factory.makeNode(p);
            lookup.set(n.id, n);
            this.addNode(n);
        });
        persisted.edges.forEach((p) => {
            const n = factory.makeEdge(p, lookup.get.bind(lookup));
            this.addEdge(n);
        });
        return this;
    }
    addNode(n) {
        super.addNode(n);
        const { uid } = this;
        this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
        this.storage.setItem(`${uid}.nodes`, JSON.stringify(this.nodes.map((d) => d.id)));
        n.on('setAttr', this.updateHandler);
        return this;
    }
    updateNode(n) {
        super.updateNode(n);
        const { uid } = this;
        this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
        return this;
    }
    removeNode(n) {
        if (!super.removeNode(n)) {
            return null;
        }
        const { uid } = this;
        this.storage.setItem(`${uid}.nodes`, JSON.stringify(this.nodes.map((d) => d.id)));
        this.storage.removeItem(`${uid}.node.${n.id}`);
        n.off('setAttr', this.updateHandler);
        return this;
    }
    addEdge(edgeOrSource, type, t) {
        if (edgeOrSource instanceof GraphEdge) {
            super.addEdge(edgeOrSource);
            const e = edgeOrSource;
            const { uid } = this;
            this.storage.setItem(`${uid}.edges`, JSON.stringify(this.edges.map((d) => d.id)));
            this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
            e.on('setAttr', this.updateHandler);
            return this;
        }
        return super.addEdge(edgeOrSource, type, t);
    }
    removeEdge(e) {
        if (!super.removeEdge(e)) {
            return null;
        }
        // need to shift all
        const { uid } = this;
        this.storage.setItem(`${uid}.edges`, JSON.stringify(this.edges.map((d) => d.id)));
        this.storage.removeItem(`${uid}.edge.${e.id}`);
        e.off('setAttr', this.updateHandler);
        return this;
    }
    updateEdge(e) {
        super.updateEdge(e);
        const { uid } = this;
        this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
        return this;
    }
    clear() {
        const { nnodes } = this;
        const { nedges } = this;
        if (nnodes === 0 && nedges === 0) {
            return Promise.resolve(this);
        }
        this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
        this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
        super.clear();
        const { uid } = this;
        JSON.parse(this.storage.getItem(`${uid}.nodes`)).forEach((id) => {
            this.storage.removeItem(`${uid}.node.${id}`);
        });
        this.storage.removeItem(`${uid}.nodes`);
        JSON.parse(this.storage.getItem(`${uid}.edges`)).forEach((id) => {
            this.storage.removeItem(`${uid}.edge.${id}`);
        });
        this.storage.removeItem(`${uid}.edges`);
        return Promise.resolve(this);
    }
    persist() {
        const r = {
            root: this.desc.id,
        };
        r.nodes = this.nodes.map((s) => s.persist());
        r.edges = this.edges.map((l) => l.persist());
        return r;
    }
}
//# sourceMappingURL=LocalStorageGraph.js.map