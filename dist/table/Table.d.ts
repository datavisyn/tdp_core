import { IPersistable } from '../base/IPersistable';
import { Range, RangeLike } from '../range';
import { IValueType, IValueTypeDesc, IDataType } from '../data';
import { ITable, ITableDataDescription } from './ITable';
import { ATable } from './ATable';
import { ITableLoader, ITableLoader2 } from './loader';
import { IVector } from '../vector';
import { IAnyVector } from '../vector/IVector';
/**
 * Interface for the parsing options for a table
 */
export interface IAsTableOptions {
    name?: string;
    idtype?: string;
    rowassigner?(ids: string[]): Range;
    keyProperty?: string;
}
/**
 * root matrix implementation holding the data
 * @internal
 */
export declare class Table extends ATable implements ITable {
    readonly desc: ITableDataDescription;
    private loader;
    private vectors;
    constructor(desc: ITableDataDescription, loader: ITableLoader2);
    get idtype(): import("../idtype").IDType;
    get idtypes(): import("../idtype").IDType[];
    col<T, D extends IValueTypeDesc>(i: number): IVector<T, D>;
    cols(range?: RangeLike): IAnyVector[];
    at(row: number, col: number): Promise<IValueType>;
    queryView(name: string, args: any): ITable;
    data(range?: RangeLike): Promise<any[][]>;
    colData(column: string, range?: RangeLike): Promise<any[]>;
    dataOfColumn(column: string, range?: RangeLike): Promise<any[]>;
    objects(range?: RangeLike): Promise<any[]>;
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    ids(range?: RangeLike): Promise<Range>;
    size(): number[];
    persist(): string;
    restore(persisted: any): IPersistable;
    /**
     * module entry point for creating a datatype
     * @param desc
     * @param loader
     * @returns {ITable}
     */
    static create(desc: ITableDataDescription, loader?: ITableLoader): ITable;
    static wrapObjects(desc: ITableDataDescription, data: any[], nameProperty: string | ((obj: any) => string)): Table;
    private static toObjects;
    private static toList;
    private static asTableImpl;
    static asTableFromArray(data: any[][], options?: IAsTableOptions): ITable;
    /**
     * Creates a new table from an array of arrays of data and an optional options data structure.
     * TODO: explain the relationship of this function and the "magic" JSON file.
     * @param data
     * @param options TODO - explain what these options are
     * @returns {Table}
     */
    static asTable(data: any[], options?: IAsTableOptions): ITable;
    /**
     * utility to convert a list of datatypes to a table compatible datatype object
     * @param list
     * @returns {any}
     */
    static convertToTable(list: IDataType[]): Table;
    /**
     * utility function converting all contained tables in their vectors of individual columns
     * @param list
     * @returns {IDataType[]}
     */
    static convertTableToVectors(list: IDataType[]): IDataType[];
    /**
     * lists all datasets and converts them to a table
     * @param tablesAsVectors whether tables should be converted to individual vectors
     * @returns {Promise<*>}
     */
    static listAsTable(tablesAsVectors?: boolean): Promise<Table>;
}
