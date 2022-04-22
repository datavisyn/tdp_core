import { IDataRow, Ranking, LocalDataProvider } from 'lineupjs';
import { IScoreRow, IScoreLoader } from '../base/interfaces';
import { IParams, IRow } from '../base/rest';
import { IFormMultiMap, IFormRow } from '../form/elements/FormMap';
import { IRankingWrapper } from './IRankingWrapper';
import { IPluginDesc } from '../base';
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
    readonly scores: Map<string, T>;
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
    static wrapRanking(data: LocalDataProvider, ranking: Ranking): IRankingWrapper;
}
//# sourceMappingURL=utils.d.ts.map