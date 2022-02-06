/// <reference types="react" />
import { PlotlyInfo, VisColumn } from '../interfaces';
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: Plotly.Layout): import("plotly.js").Layout;
export declare function resolveColumnValues(columns: VisColumn[]): Promise<({
    resolvedValues: {
        id: number;
        val: import("react").ReactText;
    }[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: import("react").ReactText;
    }[]>;
} | {
    resolvedValues: {
        id: number;
        val: import("react").ReactText;
    }[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: import("react").ReactText;
    }[]>;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: {
        id: number;
        val: import("react").ReactText;
    }[];
    type: import("../interfaces").EColumnTypes.NUMERICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: import("react").ReactText;
    }[]>;
} | {
    resolvedValues: {
        id: number;
        val: import("react").ReactText;
    }[];
    type: import("../interfaces").EColumnTypes.CATEGORICAL;
    info: import("../interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: import("react").ReactText;
    }[]>;
}>;
