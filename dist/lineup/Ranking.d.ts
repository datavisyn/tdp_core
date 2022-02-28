import { LocalDataProvider } from 'lineupjs';
import { IARankingViewOptions, IRankingWrapper, ISelectionAdapter } from '.';
import { ISelection, EViewMode, IAdditionalColumnDesc, IAuthorizationConfiguration } from '..';
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
    parameter: any;
    columnDesc: IAdditionalColumnDesc[];
    selectionAdapter?: ISelectionAdapter;
    options: Partial<IRankingOptions>;
    authorization?: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null;
    onUpdateEntryPoint?: (namedSet: unknown) => void;
    onItemSelectionChanged?: () => void;
    onItemSelect?: (current: ISelection, selection: ISelection, name: string) => void;
    onParameterChanged?: (parameter: string) => void;
    onCustomizeRanking?: (rankingWrapper: IRankingWrapper) => void;
    onBuiltLineUp?: (provider: LocalDataProvider) => void;
}
export interface IRankingOptions extends IARankingViewOptions {
    mode: EViewMode;
}
export declare function Ranking({ data, selection: inputSelection, itemSelection, columnDesc, parameter, selectionAdapter, options: opts, authorization, onUpdateEntryPoint, onItemSelect, onItemSelectionChanged, onParameterChanged, onCustomizeRanking, onBuiltLineUp, }: IRankingProps): JSX.Element;
//# sourceMappingURL=Ranking.d.ts.map