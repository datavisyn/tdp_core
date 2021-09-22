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
    SLIDER = 'Slider',
}

export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected: {[key: number]: boolean};
    selectionCallback: (s: number[]) => void;
    filterCallback: (s: string) => void;
}

export interface NumericalColumn {
    info: ColumnInfo;
    vals: {id: number, val: number}[];
    type: EColumnTypes.NUMERICAL;
    selectedForMultiples: boolean;
}

export interface CategoricalColumn {
    info: ColumnInfo;
    vals: {id: number, val: string}[];
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

export type ColumnInfo = {
    name: string,
    id: string
    description: string,
};

export type GenericOption = {
    name: string;
    currentColumn: NumericalColumn | CategoricalColumn;
    currentSelected: string | number | ColumnInfo
    scale: any,
    options: ColumnInfo[] | string[]
    callback: (s: ColumnInfo | number | string) => void
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
    numericalColorScaleType: GenericOption,
    alphaSlider: GenericOption
};
