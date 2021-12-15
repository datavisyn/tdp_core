import { GraphBase, GraphFactoryUtils } from './GraphBase';
export class MemoryGraph extends GraphBase {
    constructor(desc, nodes = [], edges = [], factory = GraphFactoryUtils.defaultGraphFactory) {
        super(desc, nodes, edges);
        this.factory = factory;
    }
    restore(persisted) {
        const lookup = new Map();
        persisted.nodes.forEach((p) => {
            const n = this.factory.makeNode(p);
            lookup.set(n.id, n);
            this.addNode(n);
        });
        persisted.edges.forEach((p) => {
            const n = this.factory.makeEdge(p, lookup.get.bind(lookup));
            this.addEdge(n);
        });
        return this;
    }
}
//# sourceMappingURL=MemoryGraph.js.map