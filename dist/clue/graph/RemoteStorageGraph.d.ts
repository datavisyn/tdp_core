import { GraphBase, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription, IGraphEdgeDump, IGraphNodeDump } from './graph';
export declare class RemoteStoreGraph extends GraphBase {
    private static readonly DEFAULT_BATCH_SIZE;
    private static readonly DEFAULT_WAIT_TIME_BEFORE_EARLY_FLUSH;
    private static readonly DEFAULT_WAIT_TIME_BEFORE_FULL_FLUSH;
    private updateHandler;
    private waitForSynced;
    private readonly batchSize;
    private readonly queue;
    private flushTimeout;
    constructor(desc: IGraphDataDescription);
    migrate(): PromiseLike<{
        nodes: GraphNode[];
        edges: GraphEdge[];
    }> | {
        nodes: GraphNode[];
        edges: GraphEdge[];
    };
    /**
     * Import the given nodes and edges into this graph.
     * It will override the current graph and fire a loaded event once done.
     * @param nodes Nodes to import
     * @param edges Edges to import
     * @param factory Factory to use to create the nodes and edges
     */
    import(nodes: IGraphNodeDump[], edges: IGraphEdgeDump[], factory: IGraphFactory): void;
    static load(desc: IGraphDataDescription, factory: IGraphFactory): Promise<RemoteStoreGraph>;
    private load;
    private loadImpl;
    get activeSyncOperations(): number;
    private send;
    private enqueue;
    private sendNow;
    private sendQueued;
    private flush;
    addAll(nodes: GraphNode[], edges: GraphEdge[]): PromiseLike<any>;
    addNode(n: GraphNode): Promise<this>;
    updateNode(n: GraphNode): Promise<this>;
    removeNode(n: GraphNode): Promise<this>;
    addEdge(edgeOrSource: GraphEdge | GraphNode, type?: string, t?: GraphNode): Promise<this>;
    removeEdge(e: GraphEdge): Promise<this>;
    updateEdge(e: GraphEdge): Promise<this>;
    clear(): Promise<Awaited<this>>;
}
//# sourceMappingURL=RemoteStorageGraph.d.ts.map