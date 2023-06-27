import { ADataType } from '../../data/datatype';
import { AGraph, IGraphDataDescription } from './graph';
import { IGraphFactory } from './GraphBase';
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