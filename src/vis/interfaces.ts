import { Plotly } from './Plot';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter',
  PCP = 'Parallel Coordinates',
  VIOLIN = 'Violin',
  STRIP = 'Strip',
  BAR = 'Bar',
}

export const allVisTypes: ESupportedPlotlyVis[] = [
  ESupportedPlotlyVis.SCATTER,
  ESupportedPlotlyVis.BAR,
  ESupportedPlotlyVis.VIOLIN,
  ESupportedPlotlyVis.STRIP,
  ESupportedPlotlyVis.PCP,
];

export enum EBarDisplayType {
  DEFAULT = 'Default',
  NORMALIZED = 'Normalized',
}

export enum EBarDirection {
  VERTICAL = 'Vertical',
  HORIZONTAL = 'Horizontal',
}

export enum EViolinOverlay {
  NONE = 'None',
  STRIP = 'Strip',
  BOX = 'Box',
}

export enum EBarGroupingType {
  STACK = 'Stacked',
  GROUP = 'Grouped',
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

export enum EFilterOptions {
  IN = 'Filter In',
  OUT = 'Filter Out',
  CLEAR = 'Clear Filter',
}

export enum ENumericalColorScaleType {
  SEQUENTIAL = 'Sequential',
  DIVERGENT = 'Divergent',
}

export interface IViolinConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
  violinOverlay: EViolinOverlay;
}

export interface IStripConfig {
  type: ESupportedPlotlyVis.STRIP;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
}

export interface IScatterConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  isRectBrush: boolean;
  alphaSliderVal: number;
}

export interface IBarConfig {
  type: ESupportedPlotlyVis.BAR;
  multiples: ColumnInfo | null;
  group: ColumnInfo | null;
  direction: EBarDirection;
  display: EBarDisplayType;
  groupType: EBarGroupingType;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
}

export interface IPCPConfig {
  type: ESupportedPlotlyVis.PCP;
  allColumnsSelected: ColumnInfo[];
}

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;

type ValueGetter<T> = () => Promise<T>;

export interface VisCommonColumn {
  info: ColumnInfo;
  values: ValueGetter<{ id: number; val: string | number }[]>;
}

export interface VisNumericalValue {
  id: number;
  val: number;
}

export interface VisCategoricalValue {
  id: number;
  val: string;
}

export interface VisNumericalColumn extends VisCommonColumn {
  type: EColumnTypes.NUMERICAL;
}

export interface VisCategoricalColumn extends VisCommonColumn {
  type: EColumnTypes.CATEGORICAL;
}

export type VisColumn = VisNumericalColumn | VisCategoricalColumn;

export type PlotlyInfo = {
  plots: PlotlyData[];
  legendPlots: PlotlyData[];
  rows: number;
  cols: number;
  errorMessage: string;
};

export type PlotlyData = {
  data: Partial<Plotly.PlotData>;
  xLabel: string;
  yLabel: string;
};

export type ColumnInfo = {
  name: string;
  id: string;
  description: string;
};

export type Scales = {
  color: any;
};
