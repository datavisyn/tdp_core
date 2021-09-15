import {Data} from 'plotly.js';

export enum ESupportedPlotlyVis {
    SCATTER = 'Scatter',
    PCP = 'Parallel Coordinates',
    VIOLIN = 'Violin',
    STRIP = 'Strip',
    BAR = 'Bar',
}

export enum EColumnTypes {
    NUMERICAL = 'Numerical',
    CATEGORICAL = 'Categorical',
}

export enum EGeneralFormType {
    DROPDOWN = 'Dropdown',
    BUTTON = 'Button',
}

export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selectionCallback: (s: string[]) => void;
    filterCallback: (s: string) => void;
}

export interface NumericalColumn {
    name: string;
    vals: {id: string, val: number, selected: boolean}[];
    type: EColumnTypes.NUMERICAL;
    selectedForMultiples: boolean;
}

export interface CategoricalColumn {
    name: string;
    vals: {id: string, val: string, selected: boolean}[];
    type: EColumnTypes.CATEGORICAL;
    selectedForMultiples: boolean;
}

export const allVisTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.SCATTER, ESupportedPlotlyVis.BAR, ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.STRIP, ESupportedPlotlyVis.PCP];
export const correlationTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.SCATTER];
export const comparisonTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.STRIP];
export const distributionTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.BAR];
export const highDimensionalTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.PCP];

export type PlotlyInfo = {
    plots: PlotlyData[],
    legendPlots: PlotlyData[],
    rows: number,
    cols: number,
    errorMessage: string,
    formList: string[]
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
    type: EGeneralFormType
    disabled: boolean
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
    violinOverlay: GenericOption,
    numericalColorScaleType: GenericOption
};
