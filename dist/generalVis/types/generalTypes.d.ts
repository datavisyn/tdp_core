import { Data } from 'plotly.js';
export declare type supportedPlotlyVis = 'Chooser' | 'Scatter' | 'Parallel Coordinates' | 'Violin' | 'Strip' | 'Multiples' | 'Bar';
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
    type: 'number';
    selectedForMultiples: boolean;
}
export interface CategoricalColumn {
    name: string;
    vals: {
        id: string;
        val: string;
        selected: boolean;
    }[];
    type: 'categorical';
    selectedForMultiples: boolean;
}
export declare const chartTypes: supportedPlotlyVis[];
export declare const correlationTypes: supportedPlotlyVis[];
export declare const comparisonTypes: supportedPlotlyVis[];
export declare const distributionTypes: supportedPlotlyVis[];
export declare const highDimensionalTypes: supportedPlotlyVis[];
export declare type PlotlyInfo = {
    plots: PlotlyData[];
    legendPlots: PlotlyData[];
    rows: number;
    cols: number;
    errorMessage: string;
    dropdownList: string[];
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
    type: 'button' | 'dropdown';
    active: boolean;
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
