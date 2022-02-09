import { IPersistable } from '../base/IPersistable';
import { Range, RangeLike } from '../range';
import { IDType, ASelectAble } from '../idtype';
import { IVector } from '../vector';
import { ITable, IQueryArgs } from './ITable';
import { IValueType, IValueTypeDesc } from '../data';
import { IInternalAccess } from './internal/InternalAccess';
/**
 * base class for different Table implementations, views, transposed,...
 * @internal
 */
export declare abstract class ATable extends ASelectAble implements IInternalAccess {
    protected root: ITable & IInternalAccess;
    constructor(root: ITable & IInternalAccess);
    get dim(): number[];
    get nrow(): number;
    get ncol(): number;
    abstract size(): number[];
    view(range?: RangeLike): ITable;
    abstract dataOfColumn<T>(column: string, range?: RangeLike): Promise<T[]>;
    abstract queryView(name: string, args: IQueryArgs): ITable;
    idView(idRange?: RangeLike): Promise<ITable>;
    reduce<T, D extends IValueTypeDesc>(f: (row: IValueType[]) => T, thisArgument?: any, valuetype?: D, idtype?: IDType): IVector<T, D>;
    restore(persisted: any): IPersistable;
}
/**
 * @internal
 */
export declare class TableView extends ATable implements ITable {
    private range;
    private vectors;
    constructor(root: ITable & IInternalAccess, range: Range);
    get desc(): import("./ITable").ITableDataDescription;
    persist(): {
        root: any;
        range: string;
    };
    restore(persisted: any): ITable;
    size(): number[];
    at(row: number, col: number): Promise<any>;
    col<T, D extends IValueTypeDesc>(i: number): IVector<T, D>;
    cols(range?: RangeLike): any;
    data(range?: RangeLike): Promise<any[][]>;
    colData<T>(column: string, range?: RangeLike): Promise<T[]>;
    dataOfColumn<T>(column: string, range?: RangeLike): Promise<T[]>;
    objects(range?: RangeLike): Promise<any[]>;
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    ids(range?: RangeLike): Promise<Range>;
    view(range?: RangeLike): TableView;
    get idtype(): IDType;
    get idtypes(): IDType[];
    queryView(name: string, args: any): ITable;
}
//# sourceMappingURL=ATable.d.ts.map