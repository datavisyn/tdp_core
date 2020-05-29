/**
 * Created by sam on 13.02.2017.
 */
import { IScoreRow } from '../../base/interfaces';
import { IParams, IRow } from '../../base/rest';
import { IDataRow } from 'lineupjs';
import { IFormMultiMap, IFormRow } from '../../form/elements/FormMap';
import { IPluginDesc } from 'phovea_core';
import { IScoreLoader } from '../../base/interfaces';
import { Ranking, LocalDataProvider } from 'lineupjs';
import { IRankingWrapper } from './IRankingWrapper';
/**
 * Interface for AScoreAccessorProxy
 */
export interface IAccessorFunc<T> {
    (row: IDataRow): T;
}
export declare class AScoreAccessorProxy<T> {
    private readonly missingValue;
    /**
     * the accessor for the score column
     * @param row
     */
    readonly accessor: IAccessorFunc<T>;
    private readonly scores;
    constructor(missingValue?: T);
    clear(): void;
    setRows(rows: IScoreRow<T>[]): void;
    protected access(row: IRow): T;
}
export declare class LineupUtils {
    /**
     * Wraps the score such that the plugin is loaded and the score modal opened, when the factory function is called
     * @param score
     * @returns {IScoreLoader}
     */
    static wrap(score: IPluginDesc): IScoreLoader;
    /**
     * creates and accessor helper
     * @param colDesc
     * @returns {CategoricalScoreAccessorProxy|NumberScoreAccessorProxy}
     */
    static createAccessor(colDesc: any): AScoreAccessorProxy<any>;
    /**
     * converts the given filter object to request params
     * @param filter input filter
     */
    static toFilter(filter: IFormMultiMap | IFormRow[]): IParams;
    static toFilterString(filter: IFormMultiMap, key2name?: Map<string, string>): string;
    /**
     * generator for a FormMap compatible badgeProvider based on the given database url
     */
    static previewFilterHint(database: string, view: string, extraParams?: () => any): (rows: IFormRow[]) => Promise<string>;
    /**
   * Returns the all items that are not in the given two arrays
   * TODO improve performance of diff algorithm
   * @param array1
   * @param array2
   * @returns {any}
   */
    static array_diff<T>(array1: T[], array2: T[]): T[];
    /**
     * Returns all elements from set1 which are not in set2
     * @param set1
     * @param set2
     * @returns Set<T>
     */
    static set_diff<T>(set1: Set<T>, set2: Set<T>): Set<T>;
    static wrapRanking(data: LocalDataProvider, ranking: Ranking): IRankingWrapper;
}
