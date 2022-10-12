import { GraphNode, GraphEdge, AGraph, IGraph, IGraphDataDescription, IGraphNodeDump, IGraphEdgeDump } from './graph';

export interface IGraphFactory {
  makeNode(p: any): GraphNode;
  makeEdge(p: any, lookup: (id: number) => GraphNode): GraphEdge;
}

export interface IGraphDump {
  /**
   * Name taken from the `desc.id`
   */
  root: string;

  /**
   * List of serializable nodes
   */
  nodes: IGraphNodeDump[];

  /**
   * List of serializable edges
   */
  edges: IGraphEdgeDump[];
}

export class GraphFactoryUtils {
  static defaultGraphFactory: IGraphFactory = {
    makeNode: (p: any) => new GraphNode().restore(p),
    makeEdge: (p: any, lookup) => new GraphEdge().restore(p, lookup),
  };
}

export class GraphBase extends AGraph implements IGraph {
  private readonly _nodes: GraphNode[];

  private readonly _edges: GraphEdge[];

  constructor(public readonly desc: IGraphDataDescription, nodes: GraphNode[] = [], edges: GraphEdge[] = []) {
    super();
    this._nodes = nodes;
    this._edges = edges;
  }

  get nodes() {
    return this._nodes;
  }

  get edges() {
    return this._edges;
  }

  /**
   * migrate one graph to another cleaning this graph returning node references
   * @returns {{nodes: GraphNode[]; edges: GraphEdge[]}}
   */
  migrate(): PromiseLike<{ nodes: GraphNode[]; edges: GraphEdge[] }> | { nodes: GraphNode[]; edges: GraphEdge[] } {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  addNode(n: GraphNode): this | PromiseLike<this> {
    this.nodes.push(n);
    this.fire('add_node', n);
    return this;
  }

  updateNode(n: GraphNode): this | PromiseLike<this> {
    // since we store a reference we don't need to do anything
    this.fire('update_node', n);
    return this;
  }

  removeNode(n: GraphNode): this | PromiseLike<this> {
    const i = this.nodes.indexOf(n);
    if (i < 0) {
      return null;
    }
    this.nodes.splice(i, 1);
    this.fire('remove_node', n);
    return this;
  }

  addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode): this | PromiseLike<this> {
    if (edgeOrSource instanceof GraphEdge) {
      const e = <GraphEdge>edgeOrSource;
      this.edges.push(e);
      this.fire('add_edge', e, e.type, e.source, e.target);
      return this;
    }
    return this.addEdge(new GraphEdge(type, <GraphNode>edgeOrSource, t));
  }

  updateEdge(e: GraphEdge): this | PromiseLike<this> {
    // since we store a reference we don't need to do anything
    this.fire('update_edge', e);
    return this;
  }

  removeEdge(e: GraphEdge): this | PromiseLike<this> {
    const i = this.edges.indexOf(e);
    if (i < 0) {
      return null;
    }
    e.takeDown();
    this.edges.splice(i, 1);
    this.fire('remove_edge', e);
    return this;
  }

  clear(): Promise<this> {
    this.nodes.splice(0, this.nodes.length);
    this.edges.splice(0, this.edges.length);
    return Promise.resolve(this);
  }

  persist(): IGraphDump {
    return {
      root: this.desc.id,
      nodes: this.nodes.map((s) => s.persist()),
      edges: this.edges.map((l) => l.persist()),
    };
  }

  restore(dump: IGraphDump) {
    return this;
  }
}
