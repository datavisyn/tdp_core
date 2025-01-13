import { ICategory, ICategoryNode, LocalDataProvider } from 'lineupjs';
import { IServerColumn } from 'visyn_core/base';
import { IAdditionalColumnDesc } from '../base/interfaces';
export interface IColumnOptions extends Pick<IAdditionalColumnDesc, 'selectedId' | 'selectedSubtype' | 'initialRanking' | 'chooserGroup'> {
    /**
     * visible by default
     * @default true
     * @deprecated use initialRanking
     */
    visible?: boolean;
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
    static numberCol(column: string, min?: number, max?: number, options?: Partial<IColumnOptions>): IAdditionalColumnDesc;
    /**
     * creates a new LineUp description for a categorical column
     * @param {string} column the column name to use
     * @param {(string | Partial<ICategory>)[]} categories description of the categories
     * @param {Partial<IColumnOptions>} options
     * @returns {IAdditionalColumnDesc}
     * @deprecated use `LineUpBuilder` instead, i.e. `buildCategoricalColumn(column).categories(categories).custom('initialRanking', true)`.
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
    static createInitialRanking(provider: LocalDataProvider, options?: Partial<IInitialRankingOptions>): void;
    static deriveColumns(columns: IServerColumn[]): IAdditionalColumnDesc[];
    private static isHierarchical;
    private static deriveHierarchy;
}
//# sourceMappingURL=desc.d.ts.map