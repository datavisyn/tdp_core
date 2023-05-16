import React from 'react';
import { LocalDataProvider } from 'lineupjs';
import type { IRankingProps } from './Ranking';
import { ISelection } from '../base/interfaces';
import { ISelectionAdapter } from './selection/ISelectionAdapter';
import { IAuthorizationConfiguration } from '../auth/interfaces';
/**
 *
 */
export interface IRankingViewComponentProps extends IRankingProps {
    /**
     * Selection of the previous view
     */
    selection?: ISelection;
    provider: LocalDataProvider;
    parameters: any[];
    selectionAdapter?: ISelectionAdapter;
    authorization?: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null;
}
export declare function RankingViewComponent({ data, selection: inputSelection, itemSelection, columnDesc, parameters, provider, selectionAdapter, options, authorization, onItemSelect, onItemSelectionChanged, onCustomizeRanking, onBuiltLineUp, onUpdateEntryPoint, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }: IRankingViewComponentProps): React.JSX.Element;
//# sourceMappingURL=RankingViewComponent.d.ts.map