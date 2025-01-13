import { IGraphFactory } from './GraphBase';
import { AGraph, IGraphDataDescription } from './graph';
import { ADataType } from '../../data/datatype';
export declare class GraphProxy extends ADataType<IGraphDataDescription> {
    private cache;
    private loaded;
    get nnodes(): number;
    get nedges(): number;
    get dim(): number[];
    impl(factory?: IGraphFactory): Promise<AGraph>;
    get idtypes(): import("visyn_core/idtype").IDType[];
    /**
     * module entry point for creating a datatype
     * @param desc
     * @returns {IMatrix}
     */
    static create(desc: IGraphDataDescription): GraphProxy;
}
//# sourceMappingURL=GraphProxy.d.ts.map