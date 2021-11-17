import { ADataType } from '../data/datatype';
import { Range, RangeLike } from '../range';
import { AGraph, IGraphDataDescription } from './graph';
import { IGraphFactory } from './GraphBase';
export declare class GraphProxy extends ADataType<IGraphDataDescription> {
    private cache;
    private loaded;
    constructor(desc: IGraphDataDescription);
    get nnodes(): number;
    get nedges(): number;
    get dim(): number[];
    impl(factory?: IGraphFactory): PromiseLike<AGraph>;
    ids(range?: RangeLike): Promise<Range>;
    get idtypes(): import("../idtype").IDType[];
    /**
     * module entry point for creating a datatype
     * @param desc
     * @returns {IMatrix}
     */
    static create(desc: IGraphDataDescription): GraphProxy;
}
