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

type ValueGetter<T> = () => Promise<T>;

export interface VisCommonColumn {
    info: ColumnInfo;
    values: ValueGetter<{id: number, val: string|number}[]>;
}

export interface VisNumericalColumn extends VisCommonColumn {
    type: EColumnTypes.NUMERICAL;
}

export interface VisCategoricalColumn extends VisCommonColumn {
    colors: string[];
    type: EColumnTypes.CATEGORICAL;
}

export type VisColumn = VisNumericalColumn | VisCategoricalColumn;

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
