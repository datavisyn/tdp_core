import {Data} from 'plotly.js';
import {IBarConfig} from './bar/utils';
import {IPCPConfig} from './pcp/utils';
import {IScatterConfig} from './scatter/utils';
import {IStripConfig} from './strip/utils';
import {IViolinConfig} from './violin/utils';

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
    CLEAR = 'Clear Filter',
}

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;

export interface NumericalColumn {
    info: ColumnInfo;
    values: {id: number, val: number}[];
    // TODO: Think about making async accessor function:
    // values: (rows: object[]) => Promise<{id: number, val: number}[]>;
    type: EColumnTypes.NUMERICAL;
}

export interface CategoricalColumn {
    info: ColumnInfo;
    colors: string[];
    values: {id: number, val: string}[];
    type: EColumnTypes.CATEGORICAL;
}

export type PlotlyInfo = {
    plots: PlotlyData[],
    legendPlots: PlotlyData[],
    rows: number,
    cols: number,
    errorMessage: string,
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
};
