import {Data} from 'plotly.js';
import {IBarConfig} from '../plotUtils/bar';
import {IPCPConfig} from '../plotUtils/pcp';
import {IScatterConfig} from '../plotUtils/scatter';
import {IStripConfig} from '../plotUtils/strip';
import {IViolinConfig} from '../plotUtils/violin';

export enum ESupportedPlotlyVis {
    SCATTER = 'Scatter',
    PCP = 'Parallel Coordinates',
    VIOLIN = 'Violin',
    STRIP = 'Strip',
    BAR = 'Bar',
}

export const allVisTypes: ESupportedPlotlyVis[] = [ESupportedPlotlyVis.SCATTER, ESupportedPlotlyVis.BAR, ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.STRIP, ESupportedPlotlyVis.PCP];

export enum EColumnTypes {
    NUMERICAL = 'Numerical',
    CATEGORICAL = 'Categorical',
}

export enum EGeneralFormType {
    DROPDOWN = 'Dropdown',
    BUTTON = 'Button',
    SLIDER = 'Slider',
}

export enum EFilterOptions {
    IN = 'Filter In',
    OUT = 'Filter Out',
    CLEAR = 'Clear',
}

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;

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

export type Scales = {
    color: any
    shape: any
};
