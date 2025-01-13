import { IEvent, appContext } from 'visyn_core/base';

import { GraphBase, IGraphDump, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription, IGraphEdgeDump, IGraphNodeDump } from './graph';

interface ISyncItem {
  type: 'node' | 'edge';
  op: 'add' | 'remove' | 'update';
  id?: number;
  desc?: any;
}

export class RemoteStoreGraph extends GraphBase {
  private static readonly DEFAULT_BATCH_SIZE = 10;

  private static readonly DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH = 1000; // ms

  private static readonly DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH = 100; // ms

  private updateHandler = (event: IEvent) => {
    const s = event.target;
    if (s instanceof GraphNode) {
      this.updateNode(<GraphNode>s);
    }
    if (s instanceof GraphEdge) {
      this.updateEdge(<GraphEdge>s);
    }
  };

  private waitForSynced = 0;

  private readonly batchSize: number;

  private readonly queue: ISyncItem[] = [];

  private flushTimeout = -1;

  constructor(desc: IGraphDataDescription) {
    super(desc);
    this.batchSize = desc.attrs.batchSize || RemoteStoreGraph.DEFAULT_BATCH_SIZE;
  }

  migrate() {
    this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
    this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
    // TODO delete old
    return super.migrate();
  }

  /**
   * Import the given nodes and edges into this graph.
   * It will override the current graph and fire a loaded event once done.
   * @param nodes Nodes to import
   * @param edges Edges to import
   * @param factory Factory to use to create the nodes and edges
   */
  import(nodes: IGraphNodeDump[], edges: IGraphEdgeDump[], factory: IGraphFactory) {
    this.loadImpl(nodes, edges, factory);
  }

  static load(desc: IGraphDataDescription, factory: IGraphFactory) {
    const r = new RemoteStoreGraph(desc);
    return r.load(factory);
  }

  private async load(factory: IGraphFactory) {
    this.fire('sync_load_start,sync_start', ++this.waitForSynced);
    const r: IGraphDump = await appContext.sendAPI(`/dataset/graph/${this.desc.id}/data`);
    this.loadImpl(r.nodes, r.edges, factory);
    this.fire('sync_load,sync', --this.waitForSynced);
    return this;
  }

  private loadImpl(nodes: IGraphNodeDump[], edges: IGraphEdgeDump[], factory: IGraphFactory) {
    const lookup = new Map<number, GraphNode>();
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

  private send(type: 'node' | 'edge', op: 'add' | 'update' | 'remove', elem: GraphNode | GraphEdge) {
    if (this.batchSize <= 1) {
      return this.sendNow(type, op, elem);
    }
    const item: ISyncItem = { type, op, id: elem.id, desc: elem.persist() };
    return this.enqueue(item);
  }

  private enqueue(item: ISyncItem) {
    if (this.flushTimeout >= 0) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = -1;
    }
    this.queue.push(item);
    if (this.queue.length >= this.batchSize * 2) {
      // really full
      return this.sendQueued();
    }
    const wait =
      this.queue.length >= this.batchSize ? RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH : RemoteStoreGraph.DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH;
    // send it at most timeout ms if there is no update in between
    this.flushTimeout = <any>setTimeout(() => {
      this.sendQueued();
    }, wait);
    return undefined;
  }

  private sendNow(type: 'node' | 'edge', op: 'add' | 'update' | 'remove', elem: GraphNode | GraphEdge) {
    this.fire(`sync_start_${type},sync_start`, ++this.waitForSynced, `${op}_{type}`, elem);

    const data = {
      desc: JSON.stringify(elem.persist()),
    };
    const create = () => {
      switch (op) {
        case 'add':
          return appContext.sendAPI(`/dataset/graph/${this.desc.id}/${type}`, data, 'POST');
        case 'update':
          return appContext.sendAPI(`/dataset/graph/${this.desc.id}/${type}/${elem.id}`, data, 'PUT');
        case 'remove':
          return appContext.sendAPI(`/dataset/graph/${this.desc.id}/${type}/${elem.id}`, {}, 'DELETE');
        default:
          return undefined;
      }
    };
    return create().then(() => {
      this.fire(`sync_${type},sync`, --this.waitForSynced, elem);
    });
  }

  private sendQueued(): PromiseLike<any> {
    if (this.queue.length === 0) {
      return Promise.resolve(null);
    }
    const param = JSON.stringify({ operation: 'batch', items: this.queue.slice() });
    // clear
    this.queue.splice(0, this.queue.length);

    this.fire(`sync_start`, ++this.waitForSynced, 'batch');
    return appContext.sendAPI(`/dataset/${this.desc.id}`, { desc: param }, 'POST').then(() => {
      this.fire(`sync`, --this.waitForSynced, 'batch');
      return this;
    });
  }

  private flush() {
    if (this.batchSize <= 1 || this.queue.length === 0) {
      return Promise.resolve('nothing queued');
    }
    return this.sendQueued();
  }

  addAll(nodes: GraphNode[], edges: GraphEdge[]) {
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

  async addNode(n: GraphNode): Promise<this> {
    super.addNode(n);
    n.on('setAttr', this.updateHandler);

    await this.send('node', 'add', n);
    return this;
  }

  async updateNode(n: GraphNode): Promise<this> {
    super.updateNode(n);
    await this.send('node', 'update', n);
    return this;
  }

  async removeNode(n: GraphNode): Promise<this> {
    if (!super.removeNode(n)) {
      return Promise.reject('invalid node');
    }
    n.off('setAttr', this.updateHandler);

    await this.send('node', 'remove', n);
    return this;
  }

  async addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode): Promise<this> {
    if (edgeOrSource instanceof GraphEdge) {
      super.addEdge(edgeOrSource);
      const e = <GraphEdge>edgeOrSource;
      e.on('setAttr', this.updateHandler);
      await this.send('edge', 'add', e);
      return this;
    }
    return super.addEdge(<GraphNode>edgeOrSource, type, t);
  }

  async removeEdge(e: GraphEdge): Promise<this> {
    if (!super.removeEdge(e)) {
      return Promise.reject('invalid edge');
    }
    e.off('setAttr', this.updateHandler);

    await this.send('edge', 'remove', e);
    return this;
  }

  async updateEdge(e: GraphEdge): Promise<this> {
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
        return appContext.sendAPI(`/dataset/graph/${this.desc.id}/node`, {}, 'DELETE');
      })
      .then(() => {
        this.fire('sync');
        return this;
      });
    return undefined;
  }
}
