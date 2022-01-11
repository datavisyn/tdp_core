import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from '../../base';
import { ARankingView } from '..';
import { LineUpSelectionHelper } from './LineUpSelectionHelper';
import { IDType } from '../../idtype';
export declare class GeneralVisWrapper extends EventHandler {
    /**
     * This string is assigned if a categorical value is missing and rendered by Plotly.
     */
    private static PLOTLY_CATEGORICAL_MISSING_VALUE;
    readonly node: HTMLElement;
    private viewable;
    private provider;
    private selectionHelper;
    private idType;
    private view;
    private data;
    constructor(provider: LocalDataProvider, view: ARankingView, selectionHelper: LineUpSelectionHelper, idType: IDType, doc?: Document);
    getSelectionMap(): {
        [key: number]: boolean;
    };
    selectCallback(selected: number[]): void;
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
