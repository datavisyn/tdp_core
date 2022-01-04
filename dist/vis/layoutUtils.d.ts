import { PlotlyInfo, VisColumn } from './interfaces';
/**
 * Cleans up the layout of a given trace, primarily by positioning potential small multiple plots in a reasonable way
 * @param traces the traces associated with the layout
 * @param layout the current layout to be changed. Typed to any because the plotly types complain.
 * @returns the changed layout
 */
export declare function beautifyLayout(traces: PlotlyInfo, layout: any): any;
export declare function resolveColumnValues(columns: VisColumn[]): Promise<({
    resolvedValues: {
        id: number;
        val: string | number;
    }[];
    type: import("./interfaces").EColumnTypes.NUMERICAL;
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: string | number;
    }[]>;
} | {
    resolvedValues: {
        id: number;
        val: string | number;
    }[];
    type: import("./interfaces").EColumnTypes.CATEGORICAL;
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: string | number;
    }[]>;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: {
        id: number;
        val: string | number;
    }[];
    type: import("./interfaces").EColumnTypes.NUMERICAL;
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: string | number;
    }[]>;
} | {
    resolvedValues: {
        id: number;
        val: string | number;
    }[];
    type: import("./interfaces").EColumnTypes.CATEGORICAL;
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: string | number;
    }[]>;
}>;
