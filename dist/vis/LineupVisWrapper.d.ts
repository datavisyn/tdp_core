import { LocalDataProvider } from 'lineupjs';
export interface ILineupVisWrapperProps {
    provider: LocalDataProvider;
    selectionCallback: (selected: number[]) => void;
    doc: Document;
}
export declare class LineupVisWrapper {
    protected readonly props: ILineupVisWrapperProps;
    /**
     * This string is assigned if a categorical value is missing and rendered by Plotly.
     */
    private static PLOTLY_CATEGORICAL_MISSING_VALUE;
    readonly node: HTMLElement;
    private viewable;
    constructor(props: ILineupVisWrapperProps);
    getSelectionMap: () => {
        [key: number]: boolean;
    };
    filterCallback: (s: string) => void;
    updateCustomVis: () => void;
    toggleCustomVis: () => void;
    hide: () => void;
}
