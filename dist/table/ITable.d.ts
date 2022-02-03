import { RangeLike } from '../range';
import { Range } from '../range/Range';
import { IDType } from '../idtype/IDType';
import { IDataType, IValueType, IValueTypeDesc, IDataDescription } from '../data';
import { IVector } from '../vector';
import { IAnyVector } from '../vector/IVector';
export interface IQueryArgs {
    [key: string]: number | string;
}
export interface ITableColumn<D extends IValueTypeDesc> {
    name: string;
    description?: string;
    value: D;
    getter?(row: any): any;
    /**
     * the accessor for the column
     * @default =name
     */
    column?: string;
}
export declare type IAnyTableColumn = ITableColumn<any>;
/**
 * The description, i.e., the metadata for the table (name, idtype, etc.)
 */
export interface ITableDataDescription extends IDataDescription {
    readonly loadAtOnce?: boolean;
    readonly idtype: string;
    readonly size: number[];
    readonly columns: IAnyTableColumn[];
}
/**
 * A table is a data structure made up of rows and columns. In a table, the elements within a column are always
 * of the same data type; the data types between different columns can vary. For example, the first column in a
 * table can be categorical, the second can be integers, the third can be IDs, etc.
 *
 * If your columns are of the same type, use Matrix instead.
 */
export interface ITable extends IDataType {
    readonly desc: ITableDataDescription;
    readonly ncol: number;
    readonly nrow: number;
    /**
     * id type
     */
    readonly idtype: IDType;
    /**
     * Returns the chosen columns
     * @param range optional subset
     */
    cols(range?: RangeLike): IAnyVector[];
    /**
     * Return the specific column
     * @param i
     */
    col<T, D extends IValueTypeDesc>(i: number): IVector<T, D>;
    /**
     * returns the row names
     * returns a promise for getting the row names of the table
     * @param range optional subset.
     */
    rows(range?: RangeLike): Promise<string[]>;
    /**
     * returns the row ids
     * @param range optional subset
     */
    rowIds(range?: RangeLike): Promise<Range>;
    /**
     * Creates a new view on this table specified by the given range. A view implements the ITable interface yet is still
     * backed by the data from the original table.
     *
     * When passing a single (1D range) the range applies to the rows.
     * When passing a 2D range, the row-range is in the first, the col-range in the
     * second range.
     *
     * @param range
     */
    view(range?: RangeLike): ITable;
    /**
     * TODO: document
     * @param name
     * @param args
     */
    queryView(name: string, args: IQueryArgs): ITable;
    /**
     * TODO: document
     * @param idRange
     */
    idView(idRange?: RangeLike): Promise<ITable>;
    /**
     * reduces the current matrix to a vector using the given reduce function
     * @param f the reduce function
     * @param thisArgument the this context for the function default the matrix
     * @param valuetype the new value type by default the same as matrix valuetype
     * @param idtype the new vlaue type by default the same as matrix rowtype
     */
    reduce<T, D extends IValueTypeDesc>(f: (row: any[]) => T, thisArgument?: any, valuetype?: D, idtype?: IDType): IVector<T, D>;
    /**
     * returns a promise for getting one cell
     * @param row
     * @param col
     */
    at(row: number, col: number): Promise<IValueType>;
    /**
     * Returns a promise for getting the data as two dimensional array.
     *
     * When passing a single (1D range) the range applies to the rows.
     * When passing a 2D range, the row-range is in the first, the col-range in the
     * second range.
     * @param range
     */
    data(range?: RangeLike): Promise<IValueType[][]>;
    /**
     * Returns the data of the named column as an array with the data
     * @param column the name of the column to retrieve the data from
     * @param range a range operator; optional
     * @deprecated
     */
    colData<T>(column: string, range?: RangeLike): Promise<T[]>;
    /**
     * Returns a promise for getting the data as an array of objects, where each object has
     * fields corresponding to the columns.
     *
     * When passing a single (1D range) the range applies to the rows.
     * When passing a 2D range, the row-range is in the first, the col-range in the
     * second range.
     * @param range
     */
    objects(range?: RangeLike): Promise<any[]>;
}
//# sourceMappingURL=ITable.d.ts.map