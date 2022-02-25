import { LocalDataProvider } from 'lineupjs';
export declare class LineupVisWrapper {
    protected readonly props: {
        provider: LocalDataProvider;
        /**
         * Callback when the selection in a vis changed.
         * @param ids Selected ids.
         */
        selectionCallback(ids: string[]): void;
        doc: Document;
    };
    /**
     * This string is assigned if a categorical value is missing and rendered by Plotly.
     */
    private static PLOTLY_CATEGORICAL_MISSING_VALUE;
    readonly node: HTMLElement;
    private viewable;
    constructor(props: {
        provider: LocalDataProvider;
        /**
         * Callback when the selection in a vis changed.
         * @param ids Selected ids.
         */
        selectionCallback(ids: string[]): void;
        doc: Document;
    });
    getSelectionMap: () => {
        [id: string]: boolean;
    };
    filterCallback: (s: string) => void;
    updateCustomVis: () => void;
    toggleCustomVis: () => void;
    hide: () => void;
}
//# sourceMappingURL=LineupVisWrapper.d.ts.map