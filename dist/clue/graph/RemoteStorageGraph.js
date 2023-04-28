import { AppContext } from 'visyn_core';
import { GraphBase } from './GraphBase';
import { GraphEdge, GraphNode } from './graph';
class RemoteStoreGraph extends GraphBase {
    constructor(desc) {
        super(desc);
        this.updateHandler = (event) => {
            const s = event.target;
            if (s instanceof GraphNode) {
                this.updateNode(s);
            }
            if (s instanceof GraphEdge) {
                this.updateEdge(s);
            }
        };
        this.waitForSynced = 0;
        this.queue = [];
        this.flushTimeout = -1;
        this.batchSize = desc.attrs.batchSize || RemoteStoreGraph.DEFAULT_BATCH_SIZE;
    }
    migrate() {
        this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
        this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
        // TODO delete old
        return super.migrate();
    }
    static load(desc, factory) {
        const r = new RemoteStoreGraph(desc);
        return r.load(factory);
    }
    async load(factory) {
        this.fire('sync_load_start,sync_start', ++this.waitForSynced);
        const r = await AppContext.getInstance().sendAPI(`/dataset/graph/${this.desc.id}/data`);
        this.loadImpl(r.nodes, r.edges, factory);
        this.fire('sync_load,sync', --this.waitForSynced);
        return this;
    }
    loadImpl(nodes, edges, factory) {
        const lookup = new Map();
        const lookupFun = lookup.get.bind(lookup);
        nodes.forEach((n) => {
            const nn = factory.makeNode(n);
            lookup.set(nn.id, nn);
            nn.on('setAttr', this.updateHandler);
            super.addNode(nn);
        });
        edges.forEach((n) => {
            const nn = factory.makeEdge(n, lookupFun);
            nn.on('setAttr', this.updateHandler);
            super.addEdge(nn);
        });
        this.fire('loaded');
    }
    get activeSyncOperations() {
        return this.waitForSynced;
    }
    send(type, op, elem) {
        if (this.batchSize <= 1) {
            return this.sendNow(type, op, elem);
        }
        const item = { type, op, id: elem.id, desc: elem.persist() };
        return this.enqueue(item);
    }
    enqueue(item) {
        if (this.flushTimeout >= 0) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = -1;
        }
        this.queue.push(item);
        if (this.queue.length >= this.batchSize * 2) {
            // really full
            return this.sendQueued();
        }
        const wait = this.queue.length >= this.batchSize ? RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH : RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH;
        // send it at most timeout ms if there is no update in between
        this.flushTimeout = setTimeout(() => {
            this.sendQueued();
        }, wait);
        return undefined;
    }
    sendNow(type, op, elem) {
        this.fire(`sync_start_${type},sync_start`, ++this.waitForSynced, `${op}_{type}`, elem);
        const data = {
            desc: JSON.stringify(elem.persist()),
        };
        const create = () => {
            switch (op) {
                case 'add':
                    return AppContext.getInstance().sendAPI(`/dataset/graph/${this.desc.id}/${type}`, data, 'POST');
                case 'update':
                    return AppContext.getInstance().sendAPI(`/dataset/graph/${this.desc.id}/${type}/${elem.id}`, data, 'PUT');
                case 'remove':
                    return AppContext.getInstance().sendAPI(`/dataset/graph/${this.desc.id}/${type}/${elem.id}`, {}, 'DELETE');
                default:
                    return undefined;
            }
        };
        return create().then(() => {
            this.fire(`sync_${type},sync`, --this.waitForSynced, elem);
        });
    }
    sendQueued() {
        if (this.queue.length === 0) {
            return Promise.resolve(null);
        }
        const param = JSON.stringify({ operation: 'batch', items: this.queue.slice() });
        // clear
        this.queue.splice(0, this.queue.length);
        this.fire(`sync_start`, ++this.waitForSynced, 'batch');
        return AppContext.getInstance()
            .sendAPI(`/dataset/${this.desc.id}`, { desc: param }, 'POST')
            .then(() => {
            this.fire(`sync`, --this.waitForSynced, 'batch');
            return this;
        });
    }
    flush() {
        if (this.batchSize <= 1 || this.queue.length === 0) {
            return Promise.resolve('nothing queued');
        }
        return this.sendQueued();
    }
    addAll(nodes, edges) {
        // add all and and to queue
        nodes.forEach((n) => {
            super.addNode(n);
            n.on('setAttr', this.updateHandler);
            this.queue.push({ type: 'node', op: 'add', id: n.id, desc: n.persist() });
        });
        edges.forEach((e) => {
            super.addEdge(e);
            e.on('setAttr', this.updateHandler);
            this.queue.push({ type: 'edge', op: 'add', id: e.id, desc: e.persist() });
        });
        return this.sendQueued();
    }
    async addNode(n) {
        super.addNode(n);
        n.on('setAttr', this.updateHandler);
        await this.send('node', 'add', n);
        return this;
    }
    async updateNode(n) {
        super.updateNode(n);
        await this.send('node', 'update', n);
        return this;
    }
    async removeNode(n) {
        if (!super.removeNode(n)) {
            return Promise.reject('invalid node');
        }
        n.off('setAttr', this.updateHandler);
        await this.send('node', 'remove', n);
        return this;
    }
    async addEdge(edgeOrSource, type, t) {
        if (edgeOrSource instanceof GraphEdge) {
            super.addEdge(edgeOrSource);
            const e = edgeOrSource;
            e.on('setAttr', this.updateHandler);
            await this.send('edge', 'add', e);
            return this;
        }
        return super.addEdge(edgeOrSource, type, t);
    }
    async removeEdge(e) {
        if (!super.removeEdge(e)) {
            return Promise.reject('invalid edge');
        }
        e.off('setAttr', this.updateHandler);
        await this.send('edge', 'remove', e);
        return this;
    }
    async updateEdge(e) {
        super.updateEdge(e);
        await this.send('edge', 'update', e);
        return this;
    }
    clear() {
        if (this.nnodes === 0 && this.nedges === 0) {
            return Promise.resolve(this);
        }
        this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
        this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
        super.clear();
        this.flush()
            .then(() => {
            this.fire('sync_start', ++this.waitForSynced, 'clear');
            // clear all nodes
            return AppContext.getInstance().sendAPI(`/dataset/graph/${this.desc.id}/node`, {}, 'DELETE');
        })
            .then(() => {
            this.fire('sync');
            return this;
        });
        return undefined;
    }
}
RemoteStoreGraph.DEFAULT_BATCH_SIZE = 10;
RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH = 1000; // ms
RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH = 100; // ms
export { RemoteStoreGraph };
//# sourceMappingURL=RemoteStorageGraph.js.map