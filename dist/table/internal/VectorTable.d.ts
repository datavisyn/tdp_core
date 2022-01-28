import { IPersistable } from '../../base/IPersistable';
import { Range, RangeLike } from '../../range';
import { IDType } from '../../idtype/IDType';
import { IDataDescription, IValueTypeDesc } from '../../data';
import { ITable, ITableDataDescription, IQueryArgs } from '../ITable';
import { ATable } from '../ATable';
import { IAnyVector } from '../../vector/IVector';
import { IVector } from '../../vector';
/**
 * @internal
 */
export declare class VectorTable extends ATable implements ITable {
    private vectors;
    readonly idtype: IDType;
    readonly desc: ITableDataDescription;
    constructor(desc: IDataDescription, vectors: IAnyVector[]);
    get idtypes(): IDType[];
    col<T, D extends IValueTypeDesc>(i: number): IVector<T, D>;
    cols(range?: RangeLike): any;
    at(i: number, j: number): Promise<unknown>;
    data(range?: RangeLike): Promise<any[][]>;
    colData(column: string, range?: RangeLike): Promise<any[]>;
    dataOfColumn(column: string, range?: RangeLike): Promise<any[]>;
    objects(range?: RangeLike): Promise<{
        [x: string]: any;
    }[]>;
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number[];
    persist(): string;
    restore(persisted: any): IPersistable;
    queryView(name: string, args: IQueryArgs): ITable;
    static fromVectors(desc: IDataDescription, vecs: IAnyVector[]): VectorTable;
}
//# sourceMappingURL=VectorTable.d.ts.map