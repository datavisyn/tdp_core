import { IDTypeManager } from '../../idtype';
import { UniqueIdManager } from '../../app/UniqueIdManager';
import { IPersistable } from '../../base/IPersistable';
import { EventHandler } from '../../base/event';
import type { IDataType, IDataDescription } from '../../data';

export class AttributeContainer extends EventHandler implements IPersistable {
  private attrMap = new Map<string, any>();

  persist(): { [key: string]: any } {
    if (this.attrMap.size > 0) {
      const attrs: { [key: string]: any } = {};
      this.attrMap.forEach((v, k) => (attrs[k] = v));
      return { attrs };
    }
    return {};
  }

  setAttr(attr: string, value: any) {
    const bak = this.attrMap.get(attr);
    if (bak === value && !Array.isArray(bak)) {
      return;
    }
    this.attrMap.set(attr, value);
    this.fire(`attr-${attr}`, value, bak);
    this.fire('setAttr', attr, value, bak);
  }

  hasAttr(attr: string) {
    return this.attrMap.has(attr);
  }

  getAttr(attr: string, defaultValue: any = null) {
    if (this.attrMap.has(attr)) {
      return this.attrMap.get(attr);
    }
    return defaultValue;
  }

  get attrs() {
    return Array.from(this.attrMap.keys());
  }

  restore(persisted: { [key: string]: any }) {
    if (persisted.attrs) {
      Object.keys(persisted.attrs).forEach((k) => this.attrMap.set(k, persisted.attrs[k]));
    }
    return this;
  }

  /**
   * comparator by index
   * @param a
   * @param b
   * @returns {number}
   */
  static byIndex(a: AttributeContainer, b: AttributeContainer) {
    const ai = +a.getAttr('index', 0);
    const bi = +b.getAttr('index', 0);
    return ai - bi;
  }
}

export interface IGraphNodeDump {
  /**
   * Node type
   * @default node
   */
  type: string;

  /**
   * Id of this node
   */
  id: number;

  /**
   * Additional node attributes
   */
  [key: string]: any;
}

/**
 * a simple graph none
 */
export class GraphNode extends AttributeContainer {
  readonly outgoing: GraphEdge[] = [];

  readonly incoming: GraphEdge[] = [];

  private _id = NaN;

  constructor(public readonly type: string = 'node', id = NaN) {
    super();
    this._id = UniqueIdManager.getInstance().flagId('graph_node', id);
  }

  get id() {
    if (Number.isNaN(this._id)) {
      this._id = UniqueIdManager.getInstance().uniqueId('graph_node');
    }
    return this._id;
  }

  persist(): IGraphNodeDump {
    const r = super.persist();
    r.type = this.type;
    r.id = this.id;
    return r as IGraphNodeDump;
  }

  restore(persisted: IGraphNodeDump) {
    super.restore(persisted);
    (<any>this).type = persisted.type;
    this._id = UniqueIdManager.getInstance().flagId('graph_node', persisted.id);
    return this;
  }
}

export interface IGraphEdgeDump {
  /**
   * Edge type
   * @default edge
   */
  type: string;

  /**
   * Id of this edge
   */
  id: number;

  /**
   * Id of the source node
   */
  source: number;

  /**
   * Id of the target node
   */
  target: number;

  /**
   * Additional node attributes
   */
  [key: string]: any;
}

export class GraphEdge extends AttributeContainer {
  private _id = NaN;

  constructor(public readonly type: string = 'edge', public readonly source: GraphNode = null, public readonly target: GraphNode = null, id = NaN) {
    super();
    this._id = UniqueIdManager.getInstance().flagId('graph_edge', id);
    if (source && target) {
      this.init();
    }
  }

  get id() {
    if (Number.isNaN(this._id)) {
      this._id = UniqueIdManager.getInstance().uniqueId('graph_edge');
    }
    return this._id;
  }

  private init() {
    if (this.source) {
      this.source.outgoing.push(this);
    }
    if (this.target) {
      this.target.incoming.push(this);
    }
  }

  takeDown() {
    if (this.source) {
      this.source.outgoing.splice(this.source.outgoing.indexOf(this), 1);
    }
    if (this.target) {
      this.target.incoming.splice(this.target.incoming.indexOf(this), 1);
    }
  }

  toString() {
    return `${this.source} ${this.type} ${this.target}`;
  }

  persist(): IGraphEdgeDump {
    const r = super.persist();
    r.type = this.type;
    r.id = this.id;
    r.source = this.source?.id;
    r.target = this.target?.id;
    return r as IGraphEdgeDump;
  }

  restore(p: any, nodes?: (id: number) => GraphNode) {
    super.restore(p);
    (<any>this).type = p.type;
    this._id = UniqueIdManager.getInstance().flagId('graph_edge', p.id);
    (<any>this).source = nodes(p.source);
    (<any>this).target = nodes(p.target);
    this.init();
    return this;
  }

  static isGraphType(type: string | RegExp) {
    return (edge: GraphEdge) => (type instanceof RegExp ? type.test(edge.type) : edge.type === type);
  }
}

export interface IGraphDataDescription extends IDataDescription {
  /**
   * size: [number of nodes, number of edges]
   */
  readonly size: [number, number];

  /**
   * where to store: memory, remote, local, session, given (requires instance)
   */
  readonly storage?: string;

  /**
   * in case of storage type 'given'
   */
  readonly graph?: AGraph;

  readonly attrs: { [key: string]: any };
}

export interface IGraph extends IDataType {
  readonly desc: IGraphDataDescription;

  readonly nodes: GraphNode[];
  readonly nnodes: number;
  readonly edges: GraphEdge[];
  readonly nedges: number;

  addNode(n: GraphNode): this | PromiseLike<this>;
  updateNode(n: GraphNode): this | PromiseLike<this>;
  removeNode(n: GraphNode): this | PromiseLike<this>;

  addEdge(e: GraphEdge): this | PromiseLike<this>;
  addEdge(s: GraphNode, type: string, t: GraphNode): this | PromiseLike<this>;

  updateEdge(e: GraphEdge): this | PromiseLike<this>;
  removeEdge(e: GraphEdge): this | PromiseLike<this>;
}

export abstract class AGraph extends EventHandler {
  public static DIM_NODES = 0;

  public static IDTYPE_NODES = '_nodes';

  public static DIM_EDGES = 1;

  public static IDTYPE_EDGES = '_edges';

  abstract get nodes(): GraphNode[];

  get nnodes() {
    return this.nodes.length;
  }

  abstract get edges(): GraphEdge[];

  get nedges() {
    return this.edges.length;
  }

  get dim() {
    return [this.nodes.length, this.edges.length];
  }

  get idtypes() {
    return [AGraph.IDTYPE_NODES, AGraph.IDTYPE_EDGES].map(IDTypeManager.getInstance().resolveIdType);
  }
}
