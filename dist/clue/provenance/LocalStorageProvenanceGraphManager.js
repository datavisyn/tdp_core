import { merge } from 'lodash';
import { Permission, UserSession } from 'visyn_core';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import { LocalStorageGraph } from '../graph/LocalStorageGraph';
import { MemoryGraph } from '../graph/MemoryGraph';
export class LocalStorageProvenanceGraphManager {
    constructor(options = {}) {
        this.options = {
            storage: localStorage,
            prefix: 'clue',
            application: 'unknown',
            defaultPermission: Permission.ALL_NONE_NONE,
        };
        merge(this.options, options);
    }
    loadFromLocalStorage(suffix, defaultValue) {
        try {
            const item = this.options.storage.getItem(this.options.prefix + suffix);
            if (item === undefined || item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        }
        catch (e) {
            console.error(e);
            return defaultValue;
        }
    }
    listSync() {
        const lists = this.loadFromLocalStorage('_provenance_graphs', []);
        return (lists
            .map((id) => this.loadFromLocalStorage(`_provenance_graph.${id}`, {}))
            // filter to right application
            .filter((d) => d.attrs && d.attrs.of === this.options.application));
    }
    list() {
        return Promise.resolve(this.listSync());
    }
    getGraph(desc) {
        return Promise.resolve(LocalStorageGraph.load(desc, ProvenanceGraphUtils.provenanceGraphFactory(), this.options.storage));
    }
    async get(desc) {
        return new ProvenanceGraph(desc, await this.getGraph(desc));
    }
    async clone(graph, desc = {}) {
        const { name } = graph.desc;
        const prefix = 'Clone of ';
        const newName = name.includes(prefix) ? name : prefix + name;
        const description = `Cloned from ${name} created by ${graph.desc.creator}\n${graph.desc.description || ''}`;
        const pdesc = this.createDesc(merge({ name: newName, description }, desc));
        const newGraph = await this.getGraph(pdesc);
        newGraph.restoreDump(graph.persist(), ProvenanceGraphUtils.provenanceGraphFactory());
        return new ProvenanceGraph(pdesc, newGraph);
    }
    async import(json, desc = {}) {
        const pdesc = this.createDesc(desc);
        const newGraph = await this.getGraph(pdesc);
        newGraph.restoreDump(json, ProvenanceGraphUtils.provenanceGraphFactory());
        return new ProvenanceGraph(pdesc, newGraph);
    }
    delete(desc) {
        const lists = JSON.parse(this.options.storage.getItem(`${this.options.prefix}_provenance_graphs`) || '[]');
        lists.splice(lists.indexOf(desc.id), 1);
        LocalStorageGraph.delete(desc, this.options.storage);
        // just remove from the list
        this.options.storage.removeItem(`${this.options.prefix}_provenance_graph.${desc.id}`);
        this.options.storage.setItem(`${this.options.prefix}_provenance_graphs`, JSON.stringify(lists));
        return Promise.resolve(true);
    }
    edit(graph, desc = {}) {
        const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
        merge(base, desc);
        this.options.storage.setItem(`${this.options.prefix}_provenance_graph.${base.id}`, JSON.stringify(base));
        return Promise.resolve(base);
    }
    createDesc(overrides = {}) {
        const lists = JSON.parse(this.options.storage.getItem(`${this.options.prefix}_provenance_graphs`) || '[]');
        const uid = lists.length > 0 ? String(1 + Math.max(...lists.map((d) => parseInt(d.slice(this.options.prefix.length), 10)))) : '0';
        const id = this.options.prefix + uid;
        const desc = merge({
            type: 'provenance_graph',
            name: `Temporary Session ${uid}`,
            fqname: `${this.options.prefix}Temporary Session ${uid}`,
            id,
            local: true,
            size: [0, 0],
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            creator: UserSession.getInstance().currentUserNameOrAnonymous(),
            permissions: this.options.defaultPermission,
            ts: Date.now(),
            description: '',
        }, overrides);
        lists.push(id);
        this.options.storage.setItem(`${this.options.prefix}_provenance_graphs`, JSON.stringify(lists));
        this.options.storage.setItem(`${this.options.prefix}_provenance_graph.${id}`, JSON.stringify(desc));
        return desc;
    }
    create(desc = {}) {
        const pdesc = this.createDesc(desc);
        return this.get(pdesc);
    }
    createInMemoryDesc(base) {
        return merge({
            type: 'provenance_graph',
            name: 'In Memory Session',
            fqname: 'In Memory Session',
            id: 'memory',
            local: true,
            size: [0, 0],
            attrs: {
                graphtype: 'provenance_graph',
                of: this.options.application,
            },
            creator: UserSession.getInstance().currentUserNameOrAnonymous(),
            permissions: this.options.defaultPermission,
            ts: Date.now(),
            description: '',
        }, base || {}, {
            id: 'memory',
            local: true,
        });
    }
    createInMemory() {
        const desc = this.createInMemoryDesc();
        return new ProvenanceGraph(desc, new MemoryGraph(desc, [], [], ProvenanceGraphUtils.provenanceGraphFactory()));
    }
    cloneInMemory(graph) {
        const desc = this.createInMemoryDesc(graph.desc);
        const m = new MemoryGraph(desc, [], [], ProvenanceGraphUtils.provenanceGraphFactory());
        m.restore(graph.persist());
        return new ProvenanceGraph(desc, m);
    }
}
//# sourceMappingURL=LocalStorageProvenanceGraphManager.js.map