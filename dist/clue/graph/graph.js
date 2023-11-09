import { IDTypeManager } from 'visyn_core/idtype';
import { EventHandler } from 'visyn_core/base';
import { UniqueIdManager } from '../../app/UniqueIdManager';
export class AttributeContainer extends EventHandler {
    constructor() {
        super(...arguments);
        this.attrMap = new Map();
    }
    persist() {
        if (this.attrMap.size > 0) {
            const attrs = {};
            this.attrMap.forEach((v, k) => (attrs[k] = v));
            return { attrs };
        }
        return {};
    }
    setAttr(attr, value) {
        const bak = this.attrMap.get(attr);
        if (bak === value && !Array.isArray(bak)) {
            return;
        }
        this.attrMap.set(attr, value);
        this.fire(`attr-${attr}`, value, bak);
        this.fire('setAttr', attr, value, bak);
    }
    hasAttr(attr) {
        return this.attrMap.has(attr);
    }
    getAttr(attr, defaultValue = null) {
        if (this.attrMap.has(attr)) {
            return this.attrMap.get(attr);
        }
        return defaultValue;
    }
    get attrs() {
        return Array.from(this.attrMap.keys());
    }
    restore(persisted) {
        if (persisted.attrs) {
            Object.keys(persisted.attrs).forEach((k) => this.attrMap.set(k, persisted.attrs[k]));
        }
        return this;
    }
    /**
     * comparator by index
     * @param a
     * @param b
     * @returns {number}
     */
    static byIndex(a, b) {
        const ai = +a.getAttr('index', 0);
        const bi = +b.getAttr('index', 0);
        return ai - bi;
    }
}
/**
 * a simple graph none
 */
export class GraphNode extends AttributeContainer {
    constructor(type = 'node', id = NaN) {
        super();
        this.type = type;
        this.outgoing = [];
        this.incoming = [];
        this._id = NaN;
        this._id = UniqueIdManager.getInstance().flagId('graph_node', id);
    }
    get id() {
        if (Number.isNaN(this._id)) {
            this._id = UniqueIdManager.getInstance().uniqueId('graph_node');
        }
        return this._id;
    }
    persist() {
        const r = super.persist();
        r.type = this.type;
        r.id = this.id;
        return r;
    }
    restore(persisted) {
        super.restore(persisted);
        this.type = persisted.type;
        this._id = UniqueIdManager.getInstance().flagId('graph_node', persisted.id);
        return this;
    }
}
export class GraphEdge extends AttributeContainer {
    constructor(type = 'edge', source = null, target = null, id = NaN) {
        super();
        this.type = type;
        this.source = source;
        this.target = target;
        this._id = NaN;
        this._id = UniqueIdManager.getInstance().flagId('graph_edge', id);
        if (source && target) {
            this.init();
        }
    }
    get id() {
        if (Number.isNaN(this._id)) {
            this._id = UniqueIdManager.getInstance().uniqueId('graph_edge');
        }
        return this._id;
    }
    init() {
        if (this.source) {
            this.source.outgoing.push(this);
        }
        if (this.target) {
            this.target.incoming.push(this);
        }
    }
    takeDown() {
        if (this.source) {
            this.source.outgoing.splice(this.source.outgoing.indexOf(this), 1);
        }
        if (this.target) {
            this.target.incoming.splice(this.target.incoming.indexOf(this), 1);
        }
    }
    toString() {
        return `${this.source} ${this.type} ${this.target}`;
    }
    persist() {
        const r = super.persist();
        r.type = this.type;
        r.id = this.id;
        r.source = this.source?.id;
        r.target = this.target?.id;
        return r;
    }
    restore(p, nodes) {
        super.restore(p);
        this.type = p.type;
        this._id = UniqueIdManager.getInstance().flagId('graph_edge', p.id);
        this.source = nodes(p.source);
        this.target = nodes(p.target);
        this.init();
        return this;
    }
    static isGraphType(type) {
        return (edge) => (type instanceof RegExp ? type.test(edge.type) : edge.type === type);
    }
}
export class AGraph extends EventHandler {
    get nnodes() {
        return this.nodes.length;
    }
    get nedges() {
        return this.edges.length;
    }
    get dim() {
        return [this.nodes.length, this.edges.length];
    }
    get idtypes() {
        return [AGraph.IDTYPE_NODES, AGraph.IDTYPE_EDGES].map(IDTypeManager.getInstance().resolveIdType);
    }
}
AGraph.DIM_NODES = 0;
AGraph.IDTYPE_NODES = '_nodes';
AGraph.DIM_EDGES = 1;
AGraph.IDTYPE_EDGES = '_edges';
//# sourceMappingURL=graph.js.map