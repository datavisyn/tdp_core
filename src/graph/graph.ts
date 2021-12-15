import {SelectOperation, IDTypeManager, ASelectAble} from '../idtype';
import {ParseRangeUtils, RangeLike, Range} from '../range';
import {UniqueIdManager} from '../app/UniqueIdManager';
import {IPersistable} from '../base/IPersistable';
import {EventHandler} from '../base/event';
import {IDataType, IDataDescription} from '../data';


export class AttributeContainer extends EventHandler implements IPersistable {
  private attrMap = new Map<string, any>();

  persist(): any {
    if (this.attrMap.size > 0) {
      const attrs: any = {};
      this.attrMap.forEach((v, k) => attrs[k] = v);
      return {attrs};
    }
    return {};
  }

  setAttr(attr: string, value: any) {
    const bak = this.attrMap.get(attr);
    if (bak === value && !Array.isArray(bak)) {
      return;
    }
    this.attrMap.set(attr, value);
    this.fire('attr-' + attr, value, bak);
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

  restore(persisted: any) {
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
/**
 * a simple graph none
 */
export class GraphNode extends AttributeContainer {
  readonly outgoing: GraphEdge[] = [];
  readonly incoming: GraphEdge[] = [];

  private _id: number = NaN;

  constructor(public readonly type: string = 'node', id: number = NaN) {
    super();
    this._id = UniqueIdManager.getInstance().flagId('graph_node', id);
  }

  get id() {
    if (isNaN(this._id)) {
      this._id = UniqueIdManager.getInstance().uniqueId('graph_node');
    }
    return this._id;
  }

  persist(): any {
    const r = super.persist();
    r.type = this.type;
    r.id = this.id;
    return r;
  }

  restore(persisted: any) {
    super.restore(persisted);
    (<any>this).type = persisted.type;
    this._id = UniqueIdManager.getInstance().flagId('graph_node', persisted.id);
    return this;
  }
}

export class GraphEdge extends AttributeContainer {

  private _id: number = NaN;

  constructor(public readonly type: string = 'edge', public readonly source: GraphNode = null, public readonly target: GraphNode = null, id: number = NaN) {
    super();
    this._id = UniqueIdManager.getInstance().flagId('graph_edge', id);
    if (source && target) {
      this.init();
    }
  }

  get id() {
    if (isNaN(this._id)) {
      this._id = UniqueIdManager.getInstance().uniqueId('graph_edge');
    }
    return this._id;
  }

  private init() {
    this.source.outgoing.push(this);
    this.target.incoming.push(this);
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

  persist() {
    const r = super.persist();
    r.type = this.type;
    r.id = this.id;
    r.source = this.source.id;
    r.target = this.target.id;
    return r;
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
  static isGraphType(type: string|RegExp) {
    return (edge: GraphEdge) => type instanceof RegExp ? type.test(edge.type) : edge.type === type;
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

  readonly attrs: {[key: string]: any};
}

export interface IGraph extends IDataType {
  readonly desc: IGraphDataDescription;

  readonly nodes: GraphNode[];
  readonly nnodes: number;
  readonly edges: GraphEdge[];
  readonly nedges: number;

  addNode(n: GraphNode): this|PromiseLike<this>;
  updateNode(n: GraphNode): this|PromiseLike<this>;
  removeNode(n: GraphNode): this|PromiseLike<this>;

  addEdge(e: GraphEdge): this|PromiseLike<this>;
  addEdge(s: GraphNode, type: string, t: GraphNode): this|PromiseLike<this>;

  updateEdge(e: GraphEdge): this|PromiseLike<this>;
  removeEdge(e: GraphEdge): this|PromiseLike<this>;
}


export abstract class AGraph extends ASelectAble {

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

  ids(range: RangeLike = Range.all()) {
    const ids = (Range.list(this.nodes.map((n) => n.id), this.edges.map((n) => n.id)));
    return Promise.resolve(ids.preMultiply(ParseRangeUtils.parseRangeLike(range)));
  }

  idView(idRange: RangeLike = Range.all()): Promise<IGraph> {
    throw Error('not implemented');
  }

  selectNode(node: GraphNode, op = SelectOperation.SET) {
    this.select(AGraph.DIM_NODES, [this.nodes.indexOf(node)], op);
  }

  async selectedNodes(): Promise<GraphNode[]> {
    const r = await this.selections();
    const nodes: GraphNode[] = [];
    r.dim(AGraph.DIM_NODES).forEach((index) => nodes.push(this.nodes[index]));
    return nodes;
  }

  selectEdge(edge: GraphEdge, op = SelectOperation.SET) {
    this.select(AGraph.DIM_EDGES, [this.edges.indexOf(edge)], op);
  }

  async selectedEdges(): Promise<GraphEdge[]> {
    const r = await this.selections();
    const edges: GraphEdge[] = [];
    r.dim(AGraph.DIM_EDGES).forEach((index) => edges.push(this.edges[index]));
    return edges;
  }

  get idtypes() {
    return [AGraph.IDTYPE_NODES, AGraph.IDTYPE_EDGES].map(IDTypeManager.getInstance().resolveIdType);
  }

}
