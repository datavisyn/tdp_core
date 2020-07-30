/**
 * Created by sam on 13.02.2017.
 */
import { LocalDataProvider, IColumnDesc, ICategory, ICategoryNode } from 'lineupjs';
import { IAnyVector } from 'phovea_core';
import { IServerColumn } from '../base/rest';
import { IAdditionalColumnDesc } from '../base/interfaces';
export interface IColumnOptions {
    /**
     * visible by default
     * @default true
     * @deprecated use initialRanking
     */
    visible?: boolean;
    /**
     * part of the initial ranking by default
     * @default true
     */
    initialRanking: boolean;
    /**
     * custom label instead of the column name
     * @default column
     */
    label: string;
    /**
     * specify an initial width
     * @default -1 = none
     */
    width: number;
    /**
     * used internally to match selections to column
     * @default -1
     */
    selectedId: number;
    /**
     * used internally to match selections to multiple columns
     * @default: undefined
     */
    selectedSubtype: string;
    /**
     * extra arguments
     */
    extras?: {
        [key: string]: any;
    };
}
export interface IInitialRankingOptions {
    aggregate: boolean;
    selection: boolean;
    rank: boolean;
    order: string[];
}
export declare class ColumnDescUtils {
    private static baseColumn;
    static numberColFromArray(column: string, rows: any[], options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a numerical column
     * @param {string} column the column name to use
     * @param {number} min the input minimal value
     * @param {number} max the input maximal value
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static numberCol(column: string, min: number, max: number, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a categorical column
     * @param {string} column the column name to use
     * @param {(string | Partial<ICategory>)[]} categories description of the categories
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static categoricalCol(column: string, categories: (string | Partial<ICategory>)[], options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    static hierarchicalCol(column: string, hierarchy: ICategoryNode, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a string column
     * @param {string} column the column name to use
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static stringCol(column: string, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a link column
     * @param {string} column the column name to use
     * @param {string} linkPattern the pattern to resolve links from values, $1 will be replaced by the current value, $2 with the URL encoded version of it
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static linkCol(column: string, linkPattern: string, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a boolean column
     * @param {string} column the column name to use
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     */
    static booleanCol(column: string, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    static deriveCol(col: IAnyVector): IColumnDesc;
    static createInitialRanking(provider: LocalDataProvider, options?: Partial<IInitialRankingOptions>): void;
    static deriveColumns(columns: IServerColumn[]): IAdditionalColumnDesc[];
    private static isHierarchical;
    private static deriveHierarchy;
}
