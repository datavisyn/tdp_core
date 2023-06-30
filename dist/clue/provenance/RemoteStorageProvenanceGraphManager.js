import { merge } from 'lodash';
import { userSession } from 'visyn_core/security';
import { DataCache } from '../../data/DataCache';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import { RemoteStoreGraph } from '../graph/RemoteStorageGraph';
export class RemoteStorageProvenanceGraphManager {
    constructor(options = {}) {
        this.options = {
            application: 'unknown',
        };
        merge(this.options, options);
    }
    async list() {
        return (await DataCache.getInstance().list((d) => d.desc.type === 'graph' && d.desc.attrs.graphtype === 'provenance_graph' && d.desc.attrs.of === this.options.application)).map((di) => di.desc);
    }
    async getGraph(desc) {
        return (await DataCache.getInstance().get(desc.id)).impl(ProvenanceGraphUtils.provenanceGraphFactory());
    }
    async get(desc) {
        return new ProvenanceGraph(desc, await this.getGraph(desc));
    }
    delete(desc) {
        return DataCache.getInstance().remove(desc);
    }
    clone(graph, desc = {}) {
        return this.import(graph.persist(), desc);
    }
    /**
     * Import a provenance graph from a JSON object and return the imported graph
     * @param json Nodes and edges to be imported
     * @param desc Provenance graph metadata description to be merged with the imported graph
     * @returns Returns the imported provenance graph
     */
    async import(json, desc = {}) {
        const pdesc = merge({
            type: 'graph',
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            name: 'Persistent WS',
            creator: userSession.currentUserNameOrAnonymous(),
            ts: Date.now(),
            description: '',
            nodes: json.nodes,
            edges: json.edges,
        }, desc);
        const base = (await DataCache.getInstance().upload(pdesc));
        const impl = (await base.impl(ProvenanceGraphUtils.provenanceGraphFactory()));
        return new ProvenanceGraph(impl.desc, impl);
    }
    /**
     * Migrate a given provenance graph to a remote storage backend and return the migrated graph
     * @param graph Provenance graph to be migrated
     * @param desc Provenance graph metadata description to be merged with the migrated graph
     * @returns Returns the migrated provenance graph
     */
    async migrate(graph, desc = {}) {
        const dump = graph.persist();
        const pdesc = merge({
            type: 'graph',
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            name: 'Persistent WS',
            creator: userSession.currentUserNameOrAnonymous(),
            ts: Date.now(),
            description: '',
            nodes: dump.nodes,
            edges: dump.edges,
        }, desc);
        const uploadedDataset = await DataCache.getInstance().upload(pdesc);
        // create remote graph from the given dataset/graph desc
        const graphBackend = new RemoteStoreGraph(uploadedDataset.desc);
        // switch the localstorage backend to the remote backend for the same graph
        graph.migrateBackend(graphBackend);
        return graph;
    }
    async edit(graph, desc = {}) {
        const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
        merge(base, desc);
        const graphProxy = await DataCache.getInstance().get(base.id);
        await DataCache.getInstance().modify(graphProxy, desc);
        return base;
    }
    async create(desc = {}) {
        const pdesc = merge({
            id: undefined,
            type: 'graph',
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            name: `Persistent WS`,
            fqname: `provenance_graphs/Persistent WS`,
            creator: userSession.currentUserNameOrAnonymous(),
            size: [0, 0],
            ts: Date.now(),
            description: '',
        }, desc);
        const impl = (await DataCache.getInstance().upload(pdesc)).impl(ProvenanceGraphUtils.provenanceGraphFactory());
        return impl.then((i) => new ProvenanceGraph(i.desc, i));
    }
}
//# sourceMappingURL=RemoteStorageProvenanceGraphManager.js.map