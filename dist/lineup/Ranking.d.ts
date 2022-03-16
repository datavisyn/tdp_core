import { LocalDataProvider, IColumnDesc, Ranking as LineUpRanking } from 'lineupjs';
import { IARankingViewOptions, IRankingWrapper, ISelectionAdapter } from '.';
import { ISelection, IScoreRow, EViewMode, IAdditionalColumnDesc, IAuthorizationConfiguration } from '..';
import { ILazyLoadedColumn } from './internal/column';
export interface IScoreResult {
    instance: ILazyLoadedColumn;
    colDesc: IColumnDesc & {
        [key: string]: any;
    };
    data: IScoreRow<any>[];
}
/**
 * // TODO / QUESTIONS
 * 1. Maybe separate the parameter and input selection logic to a different component that can be customized by the ranking?
 * 2. What should we do with the stats text (Showing 25 of 100 cell lines:5 selected)?
 * 3. How do we propagate the add score event to the parent in a way that i do not have to load the data twice?
 * 4. How to trigger an update when a parameter changes without passing useless parameters that are not used in the ranking?
 */
export interface IRankingProps {
    data: any[];
    /**
     * Selection of the previous view
     */
    selection?: ISelection;
    /**
     * Own selection
     */
    itemSelection: ISelection;
    parameters: any;
    columnDesc: IAdditionalColumnDesc[];
    selectionAdapter?: ISelectionAdapter;
    options: Partial<IRankingOptions>;
    authorization?: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null;
    onItemSelectionChanged?: () => void;
    onItemSelect?: (current: ISelection, selection: ISelection, name: string) => void;
    onParameterChanged?: (parameter: string) => void;
    onFilterChanged?: (provider: LocalDataProvider, ranking: LineUpRanking) => void;
    onAddScoreColumn?: (r: IScoreResult[]) => void;
    onUpdateEntryPoint?: (namedSet: unknown) => void;
    onCustomizeRanking?: (rankingWrapper: IRankingWrapper) => void;
    onBuiltLineUp?: (provider: LocalDataProvider) => void;
    onStatsChanged?: (total: number, shown: number, selected: number) => void;
}
export interface IRankingOptions extends IARankingViewOptions {
    mode: EViewMode;
}
export declare function Ranking({ data, selection: inputSelection, itemSelection, columnDesc, parameters, selectionAdapter, options: opts, authorization, onUpdateEntryPoint, onItemSelect, onItemSelectionChanged, onFilterChanged, onCustomizeRanking, onBuiltLineUp, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }: IRankingProps): JSX.Element;
//# sourceMappingURL=Ranking.d.ts.map