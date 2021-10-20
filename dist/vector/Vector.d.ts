import { Range, RangeLike } from '../range';
import { IValueTypeDesc } from '../data';
import { IVector, IVectorDataDescription } from './IVector';
import { AVector } from './AVector';
import { IVectorLoader } from './loader';
export interface IAsVectorOptions {
    name?: string;
    idtype?: string;
    rowassigner?(ids: string[]): Range;
}
/**
 * Base vector implementation holding the data.
 * @internal
 */
export declare class Vector<T, D extends IValueTypeDesc> extends AVector<T, D> {
    readonly desc: IVectorDataDescription<D>;
    private loader;
    constructor(desc: IVectorDataDescription<D>, loader: IVectorLoader<T>);
    get valuetype(): D;
    get idtype(): import("../idtype").IDType;
    /**
     * loads all the underlying data in json format
     * TODO: load just needed data and not everything given by the requested range
     * @returns {*}
     */
    private load;
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    at(i: number): Promise<T>;
    data(range?: RangeLike): Promise<any>;
    names(range?: RangeLike): Promise<any>;
    ids(range?: RangeLike): Promise<Range>;
    get idtypes(): import("../idtype").IDType[];
    size(): number;
    sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>>;
    filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>>;
    persist(): string;
    /**
     * module entry point for creating a datatype
     * @internal
     * @param desc
     * @returns {IVector}
     */
    static create<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>): IVector<T, D>;
    static wrap<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>, rows: string[], rowIds: number[], data: T[]): Vector<unknown, D>;
    static asVector<T>(rows: string[], data: T[], options?: IAsVectorOptions): Vector<unknown, IValueTypeDesc>;
}
