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
    BUTTON = "Button"
}
export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selectionCallback: (s: string[]) => void;
    filterCallback: (s: string) => void;
}
export interface NumericalColumn {
    name: string;
    vals: {
        id: string;
        val: number;
        selected: boolean;
    }[];
    type: EColumnTypes.NUMERICAL;
    selectedForMultiples: boolean;
}
export interface CategoricalColumn {
    name: string;
    vals: {
        id: string;
        val: string;
        selected: boolean;
    }[];
    type: EColumnTypes.CATEGORICAL;
    selectedForMultiples: boolean;
}
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
export declare type GenericOption = {
    name: string;
    currentColumn: NumericalColumn | CategoricalColumn;
    currentSelected: string;
    scale: any;
    options: string[];
    callback: (s: string) => void;
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
};
