import { Data } from 'plotly.js';
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
export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected: {
        [key: number]: boolean;
    };
    selectionCallback: (s: number[]) => void;
    filterCallback: (s: string) => void;
}
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
export declare const correlationTypes: ESupportedPlotlyVis[];
export declare const comparisonTypes: ESupportedPlotlyVis[];
export declare const distributionTypes: ESupportedPlotlyVis[];
export declare const highDimensionalTypes: ESupportedPlotlyVis[];
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
