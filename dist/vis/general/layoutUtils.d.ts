import { PlotlyInfo, VisColumn } from '../interfaces';
import { Plotly } from '../Plot';
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.p
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: Plotly.Layout): Plotly.Layout;
export declare function resolveColumnValues(columns: VisColumn[]): Promise<({
    resolvedValues: (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[] | Promise<(import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[] | Promise<(import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[]>;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[] | Promise<(import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => (import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[] | Promise<(import("../interfaces").VisCategoricalValue | import("../interfaces").VisNumericalValue)[]>;
}>;
//# sourceMappingURL=layoutUtils.d.ts.map