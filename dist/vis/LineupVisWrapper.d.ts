import { LocalDataProvider } from 'lineupjs';
export interface ILineupVisWrapperArgs {
    provider: LocalDataProvider;
    selectionCallback: (selected: number[]) => void;
    doc: Document;
}
export declare class LineupVisWrapper {
    /**
     * This string is assigned if a categorical value is missing and rendered by Plotly.
     */
    private static PLOTLY_CATEGORICAL_MISSING_VALUE;
    readonly node: HTMLElement;
    private selectionCallback;
    private viewable;
    private provider;
    constructor(args: ILineupVisWrapperArgs);
    getSelectionMap(): {
        [key: number]: boolean;
    };
    filterCallback(s: string): void;
    updateCustomVis(): void;
    toggleCustomVis(): void;
    hide(): void;
}
