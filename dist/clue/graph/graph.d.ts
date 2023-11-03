import { EventHandler } from 'visyn_core/base';
import { IPersistable } from '../../base/IPersistable';
import type { IDataType, IDataDescription } from '../../data';
export declare class AttributeContainer extends EventHandler implements IPersistable {
    private attrMap;
    persist(): {
        [key: string]: any;
    };
    setAttr(attr: string, value: any): void;
    hasAttr(attr: string): boolean;
    getAttr(attr: string, defaultValue?: any): any;
    get attrs(): string[];
    restore(persisted: {
        [key: string]: any;
    }): this;
    /**
     * comparator by index
     * @param a
     * @param b
     * @returns {number}
     */
    static byIndex(a: AttributeContainer, b: AttributeContainer): number;
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
export declare class GraphNode extends AttributeContainer {
    readonly type: string;
    readonly outgoing: GraphEdge[];
    readonly incoming: GraphEdge[];
    private _id;
    constructor(type?: string, id?: number);
    get id(): number;
    persist(): IGraphNodeDump;
    restore(persisted: IGraphNodeDump): this;
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
export declare class GraphEdge extends AttributeContainer {
    readonly type: string;
    readonly source: GraphNode;
    readonly target: GraphNode;
    private _id;
    constructor(type?: string, source?: GraphNode, target?: GraphNode, id?: number);
    get id(): number;
    private init;
    takeDown(): void;
    toString(): string;
    persist(): IGraphEdgeDump;
    restore(p: any, nodes?: (id: number) => GraphNode): this;
    static isGraphType(type: string | RegExp): (edge: GraphEdge) => boolean;
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
    readonly attrs: {
        [key: string]: any;
    };
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
export declare abstract class AGraph extends EventHandler {
    static DIM_NODES: number;
    static IDTYPE_NODES: string;
    static DIM_EDGES: number;
    static IDTYPE_EDGES: string;
    abstract get nodes(): GraphNode[];
    get nnodes(): number;
    abstract get edges(): GraphEdge[];
    get nedges(): number;
    get dim(): number[];
    get idtypes(): import("visyn_core/idtype").IDType[];
}
//# sourceMappingURL=graph.d.ts.map