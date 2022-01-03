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
        val: number;
    }[] | {
        id: number;
        val: string;
    }[];
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: number;
    }[]>;
    type: import("./interfaces").EColumnTypes.NUMERICAL;
} | {
    resolvedValues: {
        id: number;
        val: number;
    }[] | {
        id: number;
        val: string;
    }[];
    info: import("./interfaces").ColumnInfo;
    colors: string[];
    values: () => Promise<{
        id: number;
        val: string;
    }[]>;
    type: import("./interfaces").EColumnTypes.CATEGORICAL;
})[]>;
export declare function resolveSingleColumn(column: VisColumn): Promise<{
    resolvedValues: {
        id: number;
        val: number;
    }[] | {
        id: number;
        val: string;
    }[];
    info: import("./interfaces").ColumnInfo;
    values: () => Promise<{
        id: number;
        val: number;
    }[]>;
    type: import("./interfaces").EColumnTypes.NUMERICAL;
} | {
    resolvedValues: {
        id: number;
        val: number;
    }[] | {
        id: number;
        val: string;
    }[];
    info: import("./interfaces").ColumnInfo;
    colors: string[];
    values: () => Promise<{
        id: number;
        val: string;
    }[]>;
    type: import("./interfaces").EColumnTypes.CATEGORICAL;
}>;
