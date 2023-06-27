import { merge } from 'lodash';
import { UserSession } from 'visyn_core/security';
import { DataCache } from '../../data/DataCache';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
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
    async importImpl(json, desc = {}) {
        const pdesc = merge({
            type: 'graph',
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            name: 'Persistent WS',
            creator: UserSession.getInstance().currentUserNameOrAnonymous(),
            ts: Date.now(),
            description: '',
            nodes: json.nodes,
            edges: json.edges,
        }, desc);
        const base = (await DataCache.getInstance().upload(pdesc));
        return base.impl(ProvenanceGraphUtils.provenanceGraphFactory());
    }
    async import(json, desc = {}) {
        const impl = (await this.importImpl(json, desc));
        return new ProvenanceGraph(impl.desc, impl);
    }
    async migrate(graph, desc = {}) {
        const backend = (await this.importImpl({ nodes: [], edges: [] }, desc));
        const { nodes, edges } = await graph.backend.migrate();
        backend.addAll(nodes, edges);
        graph.migrateBackend(backend);
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
            creator: UserSession.getInstance().currentUserNameOrAnonymous(),
            size: [0, 0],
            ts: Date.now(),
            description: '',
        }, desc);
        const impl = (await DataCache.getInstance().upload(pdesc)).impl(ProvenanceGraphUtils.provenanceGraphFactory());
        return impl.then((i) => new ProvenanceGraph(i.desc, i));
    }
}
//# sourceMappingURL=RemoteStorageProvenanceGraphManager.js.map