import { Data } from 'plotly.js';
import { IBarConfig } from './bar/utils';
import { IPCPConfig } from './pcp/utils';
import { IScatterConfig } from './scatter/utils';
import { IStripConfig } from './strip/utils';
import { IViolinConfig } from './violin/utils';
export declare enum ESupportedPlotlyVis {
    SCATTER = "Scatter",
    PCP = "Parallel Coordinates",
    VIOLIN = "Violin",
    STRIP = "Strip",
    BAR = "Bar"
}
export declare const allVisTypes: ESupportedPlotlyVis[];
export declare enum EColumnTypes {
    NUMERICAL = "Numerical",
    CATEGORICAL = "Categorical"
}
export declare enum EGeneralFormType {
    DROPDOWN = "Dropdown",
    BUTTON = "Button",
    SLIDER = "Slider"
}
export declare enum EFilterOptions {
    IN = "Filter In",
    OUT = "Filter Out",
    CLEAR = "Clear Filter"
}
export declare type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;
declare type ValueGetter<T> = () => Promise<T>;
export interface VisNumericalColumn {
    info: ColumnInfo;
    values: ValueGetter<{
        id: number;
        val: number;
    }[]>;
    type: EColumnTypes.NUMERICAL;
}
export interface VisCategoricalColumn {
    info: ColumnInfo;
    colors: string[];
    values: ValueGetter<{
        id: number;
        val: string;
    }[]>;
    type: EColumnTypes.CATEGORICAL;
}
export declare type VisColumn = VisNumericalColumn | VisCategoricalColumn;
export declare type PlotlyInfo = {
    plots: PlotlyData[];
    legendPlots: PlotlyData[];
    rows: number;
    cols: number;
    errorMessage: string;
};
export declare type PlotlyData = {
    data: Data;
    xLabel: string;
    yLabel: string;
};
export declare type ColumnInfo = {
    name: string;
    id: string;
    description: string;
};
export declare type Scales = {
    color: any;
};
export {};
