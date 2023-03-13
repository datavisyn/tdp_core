import { IEvent } from 'visyn_core';
import { GraphBase, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraph, IGraphDataDescription } from './graph';

export class LocalStorageGraph extends GraphBase implements IGraph {
  private storage: Storage;

  private updateHandler = (event: IEvent) => {
    const s = event.target;
    if (s instanceof GraphNode) {
      this.updateNode(<GraphNode>s);
    }
    if (s instanceof GraphEdge) {
      this.updateEdge(<GraphEdge>s);
    }
  };

  constructor(desc: IGraphDataDescription, nodes: GraphNode[] = [], edges: GraphEdge[] = [], storage: Storage = sessionStorage) {
    super(desc, nodes, edges);
    this.storage = storage;

    const { uid } = this;
    if (nodes.length > 0 || edges.length > 0) {
      this.storage.setItem(`${uid}.nodes`, JSON.stringify(nodes.map((d) => d.id)));
      nodes.forEach((n) => {
        this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
        n.on('setAttr', this.updateHandler);
      });

      this.storage.setItem(`${uid}.edges`, JSON.stringify(edges.map((d) => d.id)));
      edges.forEach((e) => {
        this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
        e.on('setAttr', this.updateHandler);
      });
    }
  }

  static migrate(graph: GraphBase, storage = sessionStorage) {
    return Promise.resolve(graph.migrate()).then(({ nodes, edges }) => {
      return new LocalStorageGraph(graph.desc, nodes, edges, storage);
    });
  }

  migrate() {
    this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
    this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
    return super.migrate();
  }

  static load(desc: IGraphDataDescription, factory: IGraphFactory, storage: Storage = sessionStorage, reset = false) {
    const r = new LocalStorageGraph(desc, [], [], storage);
    if (!reset) {
      r.load(factory);
    }
    return r;
  }

  static clone(graph: GraphBase, factory: IGraphFactory, storage: Storage = sessionStorage) {
    const r = new LocalStorageGraph(graph.desc, [], [], storage);
    r.restoreDump(graph.persist(), factory);
    return r;
  }

  private get uid() {
    return `graph${this.desc.id}`;
  }

  private load(factory: IGraphFactory) {
    const { uid } = this;
    if (this.storage.getItem(`${uid}.nodes`) == null) {
      return;
    }
    const nodeIds: string[] = JSON.parse(this.storage.getItem(`${uid}.nodes`));
    const lookup = new Map<number, GraphNode>();
    nodeIds.forEach((id) => {
      const n = JSON.parse(this.storage.getItem(`${uid}.node.${id}`));
      const nn = factory.makeNode(n);
      lookup.set(nn.id, nn);
      nn.on('setAttr', this.updateHandler);
      super.addNode(nn);
    });
    const edgeIds: string[] = JSON.parse(this.storage.getItem(`${uid}.edges`));
    edgeIds.forEach((id) => {
      const n = JSON.parse(this.storage.getItem(`${uid}.edge.${id}`));
      const nn = factory.makeEdge(n, lookup.get.bind(lookup));
      nn.on('setAttr', this.updateHandler);
      super.addEdge(nn);
    });
    this.fire('loaded');
  }

  static delete(desc: IGraphDataDescription, storage: Storage = sessionStorage) {
    const uid = `graph${desc.id}`;
    JSON.parse(storage.getItem(`${uid}.nodes`) || '[]').forEach((id: string) => {
      storage.removeItem(`${uid}.node.${id}`);
    });
    storage.removeItem(`${uid}.nodes`);
    JSON.parse(storage.getItem(`${uid}.edges`) || '[]').forEach((id: string) => {
      storage.removeItem(`${uid}.edge.${id}`);
    });
    storage.removeItem(`${uid}.edges`);
    return true;
  }

  static update(desc: IGraphDataDescription, storage: Storage = sessionStorage) {
    const uid = `graph${desc.id}`;
  }

  restoreDump(persisted: any, factory: IGraphFactory) {
    const lookup = new Map<number, GraphNode>();

    persisted.nodes.forEach((p: any) => {
      const n = factory.makeNode(p);
      lookup.set(n.id, n);
      this.addNode(n);
    });

    persisted.edges.forEach((p: any) => {
      const n = factory.makeEdge(p, lookup.get.bind(lookup));
      this.addEdge(n);
    });
    return this;
  }

  addNode(n: GraphNode) {
    super.addNode(n);
    const { uid } = this;
    this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
    this.storage.setItem(`${uid}.nodes`, JSON.stringify(this.nodes.map((d) => d.id)));
    n.on('setAttr', this.updateHandler);
    return this;
  }

  updateNode(n: GraphNode): any {
    super.updateNode(n);
    const { uid } = this;
    this.storage.setItem(`${uid}.node.${n.id}`, JSON.stringify(n.persist()));
    return this;
  }

  removeNode(n: GraphNode) {
    if (!super.removeNode(n)) {
      return null;
    }
    const { uid } = this;
    this.storage.setItem(`${uid}.nodes`, JSON.stringify(this.nodes.map((d) => d.id)));
    this.storage.removeItem(`${uid}.node.${n.id}`);
    n.off('setAttr', this.updateHandler);

    return this;
  }

  addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode) {
    if (edgeOrSource instanceof GraphEdge) {
      super.addEdge(edgeOrSource);
      const e = <GraphEdge>edgeOrSource;
      const { uid } = this;
      this.storage.setItem(`${uid}.edges`, JSON.stringify(this.edges.map((d) => d.id)));
      this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
      e.on('setAttr', this.updateHandler);
      return this;
    }
    return super.addEdge(<GraphNode>edgeOrSource, type, t);
  }

  removeEdge(e: GraphEdge) {
    if (!super.removeEdge(e)) {
      return null;
    }
    // need to shift all
    const { uid } = this;
    this.storage.setItem(`${uid}.edges`, JSON.stringify(this.edges.map((d) => d.id)));
    this.storage.removeItem(`${uid}.edge.${e.id}`);
    e.off('setAttr', this.updateHandler);
    return this;
  }

  updateEdge(e: GraphEdge): any {
    super.updateEdge(e);
    const { uid } = this;
    this.storage.setItem(`${uid}.edge.${e.id}`, JSON.stringify(e.persist()));
    return this;
  }

  clear() {
    const { nnodes } = this;
    const { nedges } = this;
    if (nnodes === 0 && nedges === 0) {
      return Promise.resolve(this);
    }
    this.nodes.forEach((n) => n.off('setAttr', this.updateHandler));
    this.edges.forEach((n) => n.off('setAttr', this.updateHandler));
    super.clear();
    const { uid } = this;
    JSON.parse(this.storage.getItem(`${uid}.nodes`)).forEach((id: string) => {
      this.storage.removeItem(`${uid}.node.${id}`);
    });
    this.storage.removeItem(`${uid}.nodes`);
    JSON.parse(this.storage.getItem(`${uid}.edges`)).forEach((id: string) => {
      this.storage.removeItem(`${uid}.edge.${id}`);
    });
    this.storage.removeItem(`${uid}.edges`);
    return Promise.resolve(this);
  }

  persist() {
    const r: any = {
      root: this.desc.id,
    };
    r.nodes = this.nodes.map((s) => s.persist());
    r.edges = this.edges.map((l) => l.persist());
    return r;
  }
}
