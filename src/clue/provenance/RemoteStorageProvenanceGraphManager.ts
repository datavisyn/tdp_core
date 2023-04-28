import { merge } from 'lodash';
import { UserSession } from 'visyn_core/security';
import { DataCache } from '../../data/DataCache';
import { ProvenanceGraph } from './ProvenanceGraph';
import type { IProvenanceGraphManager, ICommonProvenanceGraphManagerOptions } from './provenance';
import type { IProvenanceGraphDataDescription } from './ICmd';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import { GraphBase } from '../graph/GraphBase';
import { GraphProxy } from '../graph/GraphProxy';
import { RemoteStoreGraph } from '../graph/RemoteStorageGraph';
import { IDataType } from '../../data/datatype';
import { AGraph } from '../graph';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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

  private importImpl(json: { nodes: any[]; edges: any[] }, desc: any = {}): PromiseLike<AGraph> {
    const pdesc: any = merge(
      {
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
      },
      desc,
    );
    return DataCache.getInstance()
      .upload(pdesc)
      .then((base: IDataType) => {
        return (<GraphProxy>base).impl(ProvenanceGraphUtils.provenanceGraphFactory());
      });
  }

  import(json: any, desc: any = {}): PromiseLike<ProvenanceGraph> {
    return this.importImpl(json, desc).then((impl: GraphBase) => {
      return new ProvenanceGraph(<IProvenanceGraphDataDescription>impl.desc, impl);
    });
  }

  migrate(graph: ProvenanceGraph, desc: any = {}): PromiseLike<ProvenanceGraph> {
    return this.importImpl({ nodes: [], edges: [] }, desc).then((backend: RemoteStoreGraph) => {
      return Promise.resolve(graph.backend.migrate())
        .then(({ nodes, edges }) => {
          return backend.addAll(nodes, edges);
        })
        .then(() => {
          graph.migrateBackend(backend);
          return graph;
        });
    });
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
        creator: UserSession.getInstance().currentUserNameOrAnonymous(),
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
