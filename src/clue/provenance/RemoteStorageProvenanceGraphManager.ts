import merge from 'lodash/merge';
import { userSession } from 'visyn_core/security';

import type { IProvenanceGraphDataDescription } from './ICmd';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import type { ICommonProvenanceGraphManagerOptions, IProvenanceGraphManager } from './provenance';
import { DataCache } from '../../data/DataCache';
import { GraphBase } from '../graph/GraphBase';
import { GraphProxy } from '../graph/GraphProxy';
import { RemoteStoreGraph } from '../graph/RemoteStorageGraph';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IRemoteStorageProvenanceGraphManagerOptions extends ICommonProvenanceGraphManagerOptions {
  // empty for now
}

export class RemoteStorageProvenanceGraphManager implements IProvenanceGraphManager {
  private options: IRemoteStorageProvenanceGraphManagerOptions = {
    application: 'unknown',
  };

  constructor(options: IRemoteStorageProvenanceGraphManagerOptions = {}) {
    merge(this.options, options);
  }

  async list(): Promise<IProvenanceGraphDataDescription[]> {
    return (
      await DataCache.getInstance().list(
        (d) => d.desc.type === 'graph' && (<any>d.desc).attrs.graphtype === 'provenance_graph' && (<any>d.desc).attrs.of === this.options.application,
      )
    ).map((di) => <any>di.desc);
  }

  async getGraph(desc: IProvenanceGraphDataDescription): Promise<GraphBase> {
    return (<any>await DataCache.getInstance().get(desc.id)).impl(ProvenanceGraphUtils.provenanceGraphFactory());
  }

  async get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph> {
    return new ProvenanceGraph(desc, await this.getGraph(desc));
  }

  delete(desc: IProvenanceGraphDataDescription) {
    return DataCache.getInstance().remove(desc);
  }

  clone(graph: GraphBase, desc: any = {}): PromiseLike<ProvenanceGraph> {
    return this.import(graph.persist(), desc);
  }

  /**
   * Import a provenance graph from a JSON object and return the imported graph
   * @param json Nodes and edges to be imported
   * @param desc Provenance graph metadata description to be merged with the imported graph
   * @returns Returns the imported provenance graph
   */
  async import(json: any, desc: any = {}): Promise<ProvenanceGraph> {
    const pdesc: any = merge(
      {
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
      },
      desc,
    );
    const base: GraphProxy = (await DataCache.getInstance().upload(pdesc)) as GraphProxy;
    const impl: GraphBase = (await base.impl(ProvenanceGraphUtils.provenanceGraphFactory())) as GraphBase;
    return new ProvenanceGraph(<IProvenanceGraphDataDescription>impl.desc, impl);
  }

  /**
   * Migrate a given provenance graph to a remote storage backend and return the migrated graph
   * @param graph Provenance graph to be migrated
   * @param desc Provenance graph metadata description to be merged with the migrated graph
   * @returns Returns the migrated provenance graph
   */
  async migrate(graph: ProvenanceGraph, desc: any = {}): Promise<ProvenanceGraph> {
    const dump = graph.persist();

    const pdesc: any = merge(
      {
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
      },
      desc,
    );

    const uploadedDataset = await DataCache.getInstance().upload(pdesc);
    // create remote graph from the given dataset/graph desc
    const graphBackend: RemoteStoreGraph = new RemoteStoreGraph(uploadedDataset.desc as IProvenanceGraphDataDescription);
    graphBackend.import(dump.nodes, dump.edges, ProvenanceGraphUtils.provenanceGraphFactory());
    // switch the localstorage backend to the remote backend for the same graph
    graph.migrateBackend(graphBackend);
    return graph;
  }

  async edit(graph: ProvenanceGraph | IProvenanceGraphDataDescription, desc: any = {}) {
    const base = graph instanceof ProvenanceGraph ? graph.desc : graph;
    merge(base, desc);
    const graphProxy = await DataCache.getInstance().get(base.id);
    await DataCache.getInstance().modify(graphProxy, desc);
    return base;
  }

  async create(desc: any = {}) {
    const pdesc: IProvenanceGraphDataDescription = merge(
      {
        id: undefined,
        type: 'graph',
        attrs: {
          graphtype: 'provenance_graph',
          of: this.options.application,
        },
        name: `Persistent WS`,
        fqname: `provenance_graphs/Persistent WS`,
        creator: userSession.currentUserNameOrAnonymous(),
        size: <[number, number]>[0, 0],
        ts: Date.now(),
        description: '',
      },
      desc,
    );

    const impl: Promise<GraphBase> = (<any>await DataCache.getInstance().upload(pdesc)).impl(ProvenanceGraphUtils.provenanceGraphFactory());
    return impl.then((i) => new ProvenanceGraph(<IProvenanceGraphDataDescription>i.desc, i));
  }
}
