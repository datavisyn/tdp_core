import React from 'react';
import { EngineRenderer, IColumnDesc, LocalDataProvider, TaggleRenderer } from 'lineupjs';
import { IARankingViewOptions } from './IARankingViewOptions';
import { IRankingWrapper } from './IRankingWrapper';
import { ILazyLoadedColumn } from './internal/column';
import { EViewMode, IAdditionalColumnDesc, IScoreRow, ISelection } from '../base/interfaces';
import { IContext } from './selection/ISelectionAdapter';
export interface IScoreResult {
    instance: ILazyLoadedColumn;
    colDesc: IColumnDesc & {
        [key: string]: any;
    };
    data: IScoreRow<any>[];
}
export interface IRankingProps {
    data: any[];
    itemSelection: ISelection;
    columnDesc: IAdditionalColumnDesc[];
    options: Partial<IRankingOptions>;
    /**
     * Optional context
     * Used by the selectionAdapter to add or remove a column when the input selection changes
     */
    onContextChanged?: (context: Omit<IContext, 'selection'>) => void;
    onItemSelectionChanged?: () => void;
    onItemSelect?: (current: ISelection, selection: ISelection, name: string) => void;
    onAddScoreColumn?: (r: IScoreResult[]) => void;
    onUpdateEntryPoint?: (namedSet: unknown) => void;
    onCustomizeRanking?: (rankingWrapper: IRankingWrapper) => void;
    onBuiltLineUp?: (provider: LocalDataProvider, engine: EngineRenderer | TaggleRenderer) => void;
}
export interface IRankingOptions extends IARankingViewOptions {
    mode: EViewMode;
    enableCustomVis: boolean;
    idField?: string;
}
export declare function Ranking({ data, itemSelection, columnDesc, options: opts, onContextChanged, onUpdateEntryPoint, onItemSelect, onItemSelectionChanged, onCustomizeRanking, onBuiltLineUp, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }: IRankingProps): React.JSX.Element;
//# sourceMappingURL=Ranking.d.ts.map