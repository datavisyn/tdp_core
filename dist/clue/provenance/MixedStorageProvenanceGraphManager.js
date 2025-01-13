import { LocalStorageProvenanceGraphManager } from './LocalStorageProvenanceGraphManager';
import { ProvenanceGraph } from './ProvenanceGraph';
import { RemoteStorageProvenanceGraphManager } from './RemoteStorageProvenanceGraphManager';
export class MixedStorageProvenanceGraphManager {
    constructor(options = {}) {
        this.remote = new RemoteStorageProvenanceGraphManager(options);
        this.local = new LocalStorageProvenanceGraphManager(options);
    }
    listRemote() {
        return this.remote.list();
    }
    listLocal() {
        return this.local.list();
    }
    listLocalSync() {
        return this.local.listSync();
    }
    list() {
        return Promise.all([this.listLocal(), this.listRemote()]).then((arr) => arr[0].concat(arr[1]));
    }
    delete(desc) {
        if (desc.local) {
            return this.local.delete(desc);
        }
        return this.remote.delete(desc);
    }
    get(desc) {
        if (desc.local) {
            return this.local.get(desc);
        }
        return this.remote.get(desc);
    }
    getGraph(desc) {
        if (desc.local) {
            return this.local.getGraph(desc);
        }
        return this.remote.getGraph(desc);
    }
    edit(graph, desc) {
        const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
        if (base.local) {
            return this.local.edit(base, desc);
        }
        return this.remote.edit(base, desc);
    }
    async cloneLocal(desc, extras = {}) {
        return this.local.clone(await this.getGraph(desc), extras);
    }
    async cloneRemote(desc, extras = {}) {
        return this.remote.clone(await this.getGraph(desc), extras);
    }
    migrateRemote(graph, extras = {}) {
        return this.remote.migrate(graph, extras);
    }
    importLocal(json, desc = {}) {
        return this.local.import(json, desc);
    }
    importRemote(json, desc = {}) {
        return this.remote.import(json, desc);
    }
    import(json, desc = {}) {
        return this.importLocal(json, desc);
    }
    createLocal(desc = {}) {
        return this.local.create(desc);
    }
    createRemote(desc = {}) {
        return this.remote.create(desc);
    }
    create(desc = {}) {
        return this.createLocal(desc);
    }
    createInMemory() {
        return this.local.createInMemory();
    }
    cloneInMemory(desc) {
        return this.getGraph(desc).then((graph) => this.local.cloneInMemory(graph));
    }
}
//# sourceMappingURL=MixedStorageProvenanceGraphManager.js.map