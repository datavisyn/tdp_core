import { RangeLike, Range } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { IVector, IVectorDataDescription } from '../../vector';
import { AVector } from '../../vector/AVector';
import { IMatrix } from '../IMatrix';
/**
 * a simple projection of a matrix columns to a vector
 */
export declare class SliceRowVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
    private m;
    private row;
    readonly desc: IVectorDataDescription<D>;
    private rowRange;
    constructor(m: IMatrix<T, D>, row: number);
    persist(): {
        root: any;
        row: number;
    };
    restore(persisted: any): IVector<T, D>;
    get valuetype(): D;
    get idtype(): import("../..").IDType;
    get idtypes(): import("../..").IDType[];
    size(): number;
    /**
     * return the associated ids of this vector
     */
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    /**
     * returns a promise for getting one cell
     * @param i
     */
    at(i: number): Promise<T>;
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    data(range?: RangeLike): Promise<T[]>;
    sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>>;
    filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>>;
}
//# sourceMappingURL=SliceRowVector.d.ts.map