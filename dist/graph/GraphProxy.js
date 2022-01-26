import { IDTypeManager } from '../idtype';
import { ADataType } from '../data/datatype';
import { AGraph } from './graph';
import { GraphFactoryUtils } from './GraphBase';
import { RemoteStoreGraph } from './RemoteStorageGraph';
import { MemoryGraph } from './MemoryGraph';
import { LocalStorageGraph } from './LocalStorageGraph';
import { ResolveNow } from '../base/promise';
export class GraphProxy extends ADataType {
    constructor(desc) {
        super(desc);
        this.cache = null;
        this.loaded = null;
    }
    get nnodes() {
        if (this.loaded) {
            return this.loaded.nnodes;
        }
        const size = this.desc.size;
        return size[AGraph.DIM_NODES] || 0;
    }
    get nedges() {
        if (this.loaded) {
            return this.loaded.nedges;
        }
        const size = this.desc.size;
        return size[AGraph.DIM_EDGES] || 0;
    }
    get dim() {
        return [this.nnodes, this.nedges];
    }
    impl(factory = GraphFactoryUtils.defaultGraphFactory) {
        if (this.cache) {
            return this.cache;
        }
        const type = this.desc.storage || 'remote';
        if (type === 'memory') {
            //memory only
            this.loaded = new MemoryGraph(this.desc, [], [], factory);
            this.cache = ResolveNow.resolveImmediately(this.loaded);
        }
        else if (type === 'local') {
            this.loaded = LocalStorageGraph.load(this.desc, factory, localStorage);
            this.cache = ResolveNow.resolveImmediately(this.loaded);
        }
        else if (type === 'session') {
            this.loaded = LocalStorageGraph.load(this.desc, factory, sessionStorage);
            this.cache = ResolveNow.resolveImmediately(this.loaded);
        }
        else if (type === 'given' && this.desc.graph instanceof AGraph) {
            this.loaded = this.desc.graph;
            this.cache = ResolveNow.resolveImmediately(this.loaded);
        }
        else {
            this.cache = ResolveNow.resolveImmediately(RemoteStoreGraph.load(this.desc, factory)).then((graph) => this.loaded = graph);
        }
        return this.cache;
    }
    ids(selection = []) {
        if (this.cache) {
            return Promise.resolve(this.cache.then((i) => i.ids(selection))); // TODO avoid <any> type cast
        }
        return Promise.resolve([]);
    }
    get idtypes() {
        return [AGraph.IDTYPE_NODES, AGraph.IDTYPE_EDGES].map(IDTypeManager.getInstance().resolveIdType);
    }
    /**
     * module entry point for creating a datatype
     * @param desc
     * @returns {IMatrix}
     */
    static create(desc) {
        return new GraphProxy(desc);
    }
}
//# sourceMappingURL=GraphProxy.js.map