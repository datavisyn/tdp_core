/// <reference types="react" />
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
    parameters: any[];
    selectionAdapter?: ISelectionAdapter;
    authorization?: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null;
}
export declare function RankingViewComponent({ data, selection: inputSelection, itemSelection, columnDesc, parameters, selectionAdapter, options, authorization, onItemSelect, onItemSelectionChanged, onCustomizeRanking, onBuiltLineUp, onUpdateEntryPoint, 
/**
 * Maybe refactor this when using the native lineup implementation of scores
 */
onAddScoreColumn, }: IRankingViewComponentProps): JSX.Element;
//# sourceMappingURL=RankingViewComponent.d.ts.map