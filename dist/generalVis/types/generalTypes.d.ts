import { Data } from 'plotly.js';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EViolinOverlay } from '../traces/bar';
import { ENumericalColorScaleType } from '../traces/scatter';
export declare enum ESupportedPlotlyVis {
    SCATTER = "Scatter",
    PCP = "Parallel Coordinates",
    VIOLIN = "Violin",
    STRIP = "Strip",
    BAR = "Bar"
}
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
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export interface IScatterConfig {
    type: ESupportedPlotlyVis.SCATTER;
    numColumnsSelected: ColumnInfo[];
    color: ColumnInfo | null;
    numColorScaleType: ENumericalColorScaleType;
    shape: ColumnInfo | null;
    isRectBrush: boolean;
    alphaSliderVal: number;
}
export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}
export interface IBarConfig {
    type: ESupportedPlotlyVis.BAR;
    multiples: ColumnInfo | null;
    group: ColumnInfo | null;
    direction: EBarDirection;
    display: EBarDisplayType;
    groupType: EBarGroupingType;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export interface IPCPConfig {
    type: ESupportedPlotlyVis.PCP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
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
    vals: {
        id: number;
        val: string;
    }[];
    type: EColumnTypes.CATEGORICAL;
    selectedForMultiples: boolean;
}
export declare const allVisTypes: ESupportedPlotlyVis[];
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
    shape: any;
};
export declare type GenericOption = {
    name: string;
    currentColumn: NumericalColumn | CategoricalColumn;
    currentSelected: string | number | ColumnInfo;
    scale: any;
    options: ColumnInfo[] | string[];
    callback: (s: ColumnInfo | number | string) => void;
    type: EGeneralFormType;
    disabled: boolean;
};
export declare type AllDropdownOptions = {
    color: GenericOption;
    shape: GenericOption;
    opacity: GenericOption;
    bubble: GenericOption;
    groupBy: GenericOption;
    barMultiplesBy: GenericOption;
    filter: GenericOption;
    barDirection: GenericOption;
    barNormalized: GenericOption;
    barGroupType: GenericOption;
    violinOverlay: GenericOption;
    numericalColorScaleType: GenericOption;
    alphaSlider: GenericOption;
};
