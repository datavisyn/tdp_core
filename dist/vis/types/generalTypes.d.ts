import { Data } from 'plotly.js';
import { IBarConfig } from '../plotUtils/bar';
import { IPCPConfig } from '../plotUtils/pcp';
import { IScatterConfig } from '../plotUtils/scatter';
import { IStripConfig } from '../plotUtils/strip';
import { IViolinConfig } from '../plotUtils/violin';
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
    CLEAR = "Clear"
}
export declare type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;
export interface NumericalColumn {
    info: ColumnInfo;
    vals: {
        id: number;
        val: number;
    }[];
    type: EColumnTypes.NUMERICAL;
    selectedForMultiples: boolean;
}
export interface CategoricalColumn {
    info: ColumnInfo;
    colors: string[];
    vals: {
        id: number;
        val: string;
    }[];
    type: EColumnTypes.CATEGORICAL;
    selectedForMultiples: boolean;
}
export declare type PlotlyInfo = {
    plots: PlotlyData[];
    legendPlots: PlotlyData[];
    rows: number;
    cols: number;
    errorMessage: string;
    formList: string[];
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
