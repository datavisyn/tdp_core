import { Range, RangeLike } from '../../range';
import { IValueTypeDesc } from '../../data';
import { IVector, IVectorDataDescription } from '../../vector';
import { ITable, ITableColumn } from '../ITable';
import { AVector } from '../../vector/AVector';
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class TableVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
    private table;
    private index;
    readonly desc: IVectorDataDescription<D>;
    readonly column: string;
    constructor(table: ITable, index: number, desc: ITableColumn<D>);
    get valuetype(): D;
    get idtype(): import("../..").IDType;
    get idtypes(): import("../..").IDType[];
    persist(): {
        root: any;
        col: number;
    };
    restore(persisted: any): IVector<T, D>;
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    at(i: number): Promise<any>;
    data(range?: RangeLike): Promise<T[]>;
    names(range?: RangeLike): Promise<string[]>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number;
    sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>>;
    filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>>;
}
