import { IPersistable } from '../../base/IPersistable';
import { GraphBase } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription } from './graph';
export declare class MemoryGraph extends GraphBase implements IPersistable {
    private factory;
    constructor(desc: IGraphDataDescription, nodes?: GraphNode[], edges?: GraphEdge[], factory?: import("./GraphBase").IGraphFactory);
    restore(persisted: any): this;
}
//# sourceMappingURL=MemoryGraph.d.ts.map