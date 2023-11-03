import { GraphBase, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraph, IGraphDataDescription } from './graph';
export declare class LocalStorageGraph extends GraphBase implements IGraph {
    private storage;
    private updateHandler;
    constructor(desc: IGraphDataDescription, nodes?: GraphNode[], edges?: GraphEdge[], storage?: Storage);
    static migrate(graph: GraphBase, storage?: Storage): Promise<LocalStorageGraph>;
    migrate(): PromiseLike<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }> | {
        nodes: GraphNode[];
        edges: GraphEdge[];
    };
    static load(desc: IGraphDataDescription, factory: IGraphFactory, storage?: Storage, reset?: boolean): LocalStorageGraph;
    static clone(graph: GraphBase, factory: IGraphFactory, storage?: Storage): LocalStorageGraph;
    private get uid();
    private load;
    static delete(desc: IGraphDataDescription, storage?: Storage): boolean;
    static update(desc: IGraphDataDescription, storage?: Storage): void;
    restoreDump(persisted: any, factory: IGraphFactory): this;
    addNode(n: GraphNode): this;
    updateNode(n: GraphNode): any;
    removeNode(n: GraphNode): this;
    addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode): this | PromiseLike<this>;
    removeEdge(e: GraphEdge): this;
    updateEdge(e: GraphEdge): any;
    clear(): Promise<Awaited<this>>;
    persist(): any;
}
//# sourceMappingURL=LocalStorageGraph.d.ts.map