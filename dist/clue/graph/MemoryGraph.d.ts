import { IPersistable } from '../../base/IPersistable';
import { GraphBase, IGraphDump, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription } from './graph';
export declare class MemoryGraph extends GraphBase implements IPersistable {
    private factory;
    constructor(desc: IGraphDataDescription, nodes?: GraphNode[], edges?: GraphEdge[], factory?: IGraphFactory);
    restore(persisted: IGraphDump): this;
}
//# sourceMappingURL=MemoryGraph.d.ts.map