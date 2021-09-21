/// <reference types="react" />
import { Data } from 'plotly.js';
export declare type supportedPlotlyVis = 'Chooser' | 'Scatter' | 'Parallel Coordinates' | 'Violin' | 'Strip' | 'Multiples' | 'Bar';
export interface MultiplesProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
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
export declare const distributionTypes: supportedPlotlyVis[];
export declare const highDimensionalTypes: supportedPlotlyVis[];
export declare type MultipleDataTraces = {
    plots: MultiplesPlot[];
    legendPlots: MultiplesPlot[];
    rows: number;
    cols: number;
    errorMessage: string;
    dropdownList: string[];
};
export declare type MultiplesPlot = {
    data: Data;
    xLabel: string;
    yLabel: string;
};
export declare type GenericSelect = {
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
    color: GenericSelect;
    shape: GenericSelect;
    opacity: GenericSelect;
    bubble: GenericSelect;
    groupBy: GenericSelect;
    barMultiplesBy: GenericSelect;
    filter: GenericSelect;
    barDirection: GenericSelect;
    barNormalized: GenericSelect;
    barGroupType: GenericSelect;
};
export declare function Multiples(props: MultiplesProps): JSX.Element;
