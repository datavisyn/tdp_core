import { ColumnInfo, PlotlyInfo, VisColumn } from '../interfaces';
import { Plotly } from '../Plot';
/**
 * Truncate long texts (e.g., to use as axes title)
 * @param text Input text to be truncated
 * @param maxLength Maximum text length (default: 50)
 */
export declare function truncateText(text: string, maxLength?: number): string;
export declare function columnNameWithDescription(col: ColumnInfo): string;
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.p
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: Plotly.Layout): Plotly.Layout;
export declare function resolveColumnValues(columns: VisColumn[]): Promise<({
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: ColumnInfo;
    values: () => (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[] | Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
    values: () => (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[] | Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: ColumnInfo;
    values: () => (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[] | Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
} | {
    resolvedValues: (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
    values: () => (import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[] | Promise<(import("../interfaces").VisNumericalValue | import("../interfaces").VisCategoricalValue)[]>;
}>;
//# sourceMappingURL=layoutUtils.d.ts.map