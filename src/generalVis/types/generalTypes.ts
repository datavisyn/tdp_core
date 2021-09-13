import {Data} from 'plotly.js';

export type supportedPlotlyVis = 'Chooser' | 'Scatter' | 'Parallel Coordinates' | 'Violin' | 'Strip' | 'Multiples' | 'Bar';

export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selectionCallback: (s: string[]) => void;
    filterCallback: (s: string) => void;
}

export interface NumericalColumn {
    name: string;
    vals: {id: string, val: number, selected: boolean}[];
    type: 'number';
    selectedForMultiples: boolean;
}

export interface CategoricalColumn {
    name: string;
    vals: {id: string, val: string, selected: boolean}[];
    type: 'categorical';
    selectedForMultiples: boolean;
}

export const chartTypes: supportedPlotlyVis[] = ['Scatter', 'Parallel Coordinates', 'Violin', 'Strip', 'Multiples'];
export const correlationTypes: supportedPlotlyVis[] = ['Scatter'];
export const comparisonTypes: supportedPlotlyVis[] = ['Violin', 'Strip'];
export const distributionTypes: supportedPlotlyVis[] = ['Bar'];
export const highDimensionalTypes: supportedPlotlyVis[] = ['Parallel Coordinates'];

export type PlotlyInfo = {
    plots: PlotlyData[],
    legendPlots: PlotlyData[],
    rows: number,
    cols: number,
    errorMessage: string,
    dropdownList: string[]
};

export type PlotlyData = {
    data: Data,
    xLabel: string,
    yLabel: string
};

export type GenericOption = {
    name: string;
    currentColumn: NumericalColumn | CategoricalColumn;
    currentSelected: string
    scale: any,
    options: string[]
    callback: (s: string) => void
    type: 'button' | 'dropdown'
    active: boolean
};

export type AllDropdownOptions = {
    color: GenericOption,
    shape: GenericOption,
    opacity: GenericOption,
    bubble: GenericOption,
    groupBy: GenericOption,
    barMultiplesBy: GenericOption,
    filter: GenericOption,
    barDirection: GenericOption,
    barNormalized: GenericOption,
    barGroupType: GenericOption,
};
