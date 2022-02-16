import { PlotlyInfo, VisColumn } from '../interfaces';
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.p
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: Plotly.Layout): import("plotly.js").Layout;
export declare function resolveColumnValues(columns: VisColumn[]): Promise<({
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
}>;
//# sourceMappingURL=layoutUtils.d.ts.map