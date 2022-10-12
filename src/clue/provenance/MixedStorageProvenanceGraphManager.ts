import { IProvenanceGraphDump, ProvenanceGraph } from './ProvenanceGraph';
import { IProvenanceGraphManager } from './provenance';
import { IProvenanceGraphDataDescription } from './ICmd';
import { LocalStorageProvenanceGraphManager, ILocalStorageProvenanceGraphManagerOptions } from './LocalStorageProvenanceGraphManager';
import { RemoteStorageProvenanceGraphManager, IRemoteStorageProvenanceGraphManagerOptions } from './RemoteStorageProvenanceGraphManager';
import { GraphBase } from '../graph/GraphBase';

export type IMixedStorageProvenanceGraphManagerOptions = ILocalStorageProvenanceGraphManagerOptions & IRemoteStorageProvenanceGraphManagerOptions;

export class MixedStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private remote: RemoteStorageProvenanceGraphManager;

  private local: LocalStorageProvenanceGraphManager;

  constructor(options: IMixedStorageProvenanceGraphManagerOptions = {}) {
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

  list(): Promise<IProvenanceGraphDataDescription[]> {
    return Promise.all([this.listLocal(), this.listRemote()]).then((arr) => arr[0].concat(arr[1]));
  }

  delete(desc: IProvenanceGraphDataDescription): PromiseLike<boolean> {
    if (desc.local) {
      return this.local.delete(desc);
    }
    return this.remote.delete(desc);
  }

  get(desc: IProvenanceGraphDataDescription): PromiseLike<ProvenanceGraph> {
    if ((<any>desc).local) {
      return this.local.get(desc);
    }
    return this.remote.get(desc);
  }

  getGraph(desc: IProvenanceGraphDataDescription): PromiseLike<GraphBase> {
    if (desc.local) {
      return this.local.getGraph(desc);
    }
    return this.remote.getGraph(desc);
  }

  edit(graph: IProvenanceGraphDataDescription | ProvenanceGraph, desc: any): PromiseLike<IProvenanceGraphDataDescription> {
    const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
    if (base.local) {
      return this.local.edit(base, desc);
    }
    return this.remote.edit(base, desc);
  }

  async cloneLocal(desc: IProvenanceGraphDataDescription, extras: any = {}): Promise<ProvenanceGraph> {
    return this.local.clone(await this.getGraph(desc), extras);
  }

  async cloneRemote(desc: IProvenanceGraphDataDescription, extras: any = {}): Promise<ProvenanceGraph> {
    return this.remote.clone(await this.getGraph(desc), extras);
  }

  migrateRemote(graph: ProvenanceGraph, extras: any = {}): PromiseLike<ProvenanceGraph> {
    return this.remote.migrate(graph, extras);
  }

  importLocal(json: IProvenanceGraphDump, desc: any = {}) {
    return this.local.import(json, desc);
  }

  importRemote(json: IProvenanceGraphDump, desc: any = {}) {
    return this.remote.import(json, desc);
  }

  import(json: IProvenanceGraphDump, desc: any = {}) {
    return this.importLocal(json, desc);
  }

  createLocal(desc: any = {}) {
    return this.local.create(desc);
  }

  createRemote(desc: any = {}) {
    return this.remote.create(desc);
  }

  create(desc: any = {}) {
    return this.createLocal(desc);
  }

  createInMemory(): ProvenanceGraph {
    return this.local.createInMemory();
  }

  cloneInMemory(desc: IProvenanceGraphDataDescription): PromiseLike<ProvenanceGraph> {
    return this.getGraph(desc).then((graph) => this.local.cloneInMemory(graph));
  }
}
