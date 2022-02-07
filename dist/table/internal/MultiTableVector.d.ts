import { RangeLike, Range } from '../../range';
import { IValueTypeDesc, IValueType } from '../../data';
import { IVector, IVectorDataDescription } from '../../vector';
import { ITable } from '../ITable';
import { AVector } from '../../vector/AVector';
/**
 * @internal
 */
export declare class MultiTableVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
    private table;
    private f;
    private thisArgument;
    readonly valuetype: D;
    private _idtype;
    readonly desc: IVectorDataDescription<D>;
    constructor(table: ITable, f: (row: IValueType[]) => T, thisArgument?: ITable, valuetype?: D, _idtype?: import("../..").IDType);
    get idtype(): import("../..").IDType;
    get idtypes(): import("../..").IDType[];
    persist(): {
        root: any;
        f: string;
        valuetype: D;
        idtype: string;
    };
    restore(persisted: any): IVector<T, D>;
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
    at(i: number): Promise<any>;
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    data(range?: RangeLike): Promise<T[]>;
    sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>>;
    filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>>;
}
//# sourceMappingURL=MultiTableVector.d.ts.map