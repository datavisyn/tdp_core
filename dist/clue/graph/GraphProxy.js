import { IDTypeManager } from 'visyn_core/idtype';
import { ADataType } from '../../data/datatype';
import { AGraph } from './graph';
import { GraphFactoryUtils } from './GraphBase';
import { RemoteStoreGraph } from './RemoteStorageGraph';
import { MemoryGraph } from './MemoryGraph';
import { LocalStorageGraph } from './LocalStorageGraph';
export class GraphProxy extends ADataType {
    constructor() {
        super(...arguments);
        this.cache = null;
        this.loaded = null;
    }
    get nnodes() {
        if (this.loaded) {
            return this.loaded.nnodes;
        }
        const { size } = this.desc;
        return size[AGraph.DIM_NODES] || 0;
    }
    get nedges() {
        if (this.loaded) {
            return this.loaded.nedges;
        }
        const { size } = this.desc;
        return size[AGraph.DIM_EDGES] || 0;
    }
    get dim() {
        return [this.nnodes, this.nedges];
    }
    async impl(factory = GraphFactoryUtils.defaultGraphFactory) {
        if (this.cache) {
            return this.cache;
        }
        const type = this.desc.storage || 'remote';
        if (type === 'memory') {
            // memory only
            this.loaded = new MemoryGraph(this.desc, [], [], factory);
        }
        else if (type === 'local') {
            this.loaded = LocalStorageGraph.load(this.desc, factory, localStorage);
        }
        else if (type === 'session') {
            this.loaded = LocalStorageGraph.load(this.desc, factory, sessionStorage);
        }
        else if (type === 'given' && this.desc.graph instanceof AGraph) {
            this.loaded = this.desc.graph;
        }
        else {
            const graph = await RemoteStoreGraph.load(this.desc, factory);
            this.loaded = graph;
        }
        this.cache = Promise.resolve(this.loaded);
        return this.cache;
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