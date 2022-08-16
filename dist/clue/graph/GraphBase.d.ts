import { GraphNode, GraphEdge, AGraph, IGraph, IGraphDataDescription } from './graph';
export interface IGraphFactory {
    makeNode(p: any): GraphNode;
    makeEdge(p: any, lookup: (id: number) => GraphNode): GraphEdge;
}
export declare class GraphFactoryUtils {
    static defaultGraphFactory: IGraphFactory;
}
export declare class GraphBase extends AGraph implements IGraph {
    readonly desc: IGraphDataDescription;
    private readonly _nodes;
    private readonly _edges;
    constructor(desc: IGraphDataDescription, nodes?: GraphNode[], edges?: GraphEdge[]);
    get nodes(): GraphNode[];
    get edges(): GraphEdge[];
    /**
     * migrate one graph to another cleaning this graph returning node references
     * @returns {{nodes: GraphNode[]; edges: GraphEdge[]}}
     */
    migrate(): PromiseLike<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }> | {
        nodes: GraphNode[];
        edges: GraphEdge[];
    };
    addNode(n: GraphNode): this | PromiseLike<this>;
    updateNode(n: GraphNode): this | PromiseLike<this>;
    removeNode(n: GraphNode): this | PromiseLike<this>;
    addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode): this | PromiseLike<this>;
    updateEdge(e: GraphEdge): this | PromiseLike<this>;
    removeEdge(e: GraphEdge): this | PromiseLike<this>;
    clear(): Promise<this>;
    persist(): any;
    restore(dump: any): this;
}
//# sourceMappingURL=GraphBase.d.ts.map