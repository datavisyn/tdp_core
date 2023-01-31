import { Plotly } from './Plot';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter plot',
  VIOLIN = 'Violin plot',
  BAR = 'Bar chart',
  HEXBIN = 'Hexbin plot',
}

export const allVisTypes: ESupportedPlotlyVis[] = [
  ESupportedPlotlyVis.SCATTER,
  ESupportedPlotlyVis.BAR,
  ESupportedPlotlyVis.VIOLIN,
  ESupportedPlotlyVis.HEXBIN,
];

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IHexbinConfig;

export enum EBarDisplayType {
  ABSOLUTE = 'Absolute',
  NORMALIZED = 'Normalized',
}

export enum EHexbinOptions {
  COLOR = 'Color',
  PIE = 'Pie',
  BINS = 'Bins',
}

export enum EBarDirection {
  VERTICAL = 'Vertical',
  HORIZONTAL = 'Horizontal',
}

export enum EViolinOverlay {
  NONE = 'None',
  BOX = 'Box',
}

export enum EAggregateTypes {
  COUNT = 'Count',
  MIN = 'Minimum',
  AVG = 'Average',
  MED = 'Median',
  MAX = 'Maximum',
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
  CLEAR = 'Clear',
}

export enum ENumericalColorScaleType {
  SEQUENTIAL = 'Sequential',
  DIVERGENT = 'Divergent',
}

export enum EScatterSelectSettings {
  RECTANGLE = 'select',
  LASSO = 'lasso',
  ZOOM = 'zoom',
  PAN = 'pan',
}

export interface IViolinConfig {
  type: ESupportedPlotlyVis.VIOLIN;
  numColumnsSelected: ColumnInfo[];
  catColumnsSelected: ColumnInfo[];
  violinOverlay: EViolinOverlay;
}

// export interface IStripConfig {
//   type: ESupportedPlotlyVis.STRIP;
//   numColumnsSelected: ColumnInfo[];
//   catColumnsSelected: ColumnInfo[];
// }

export interface IScatterConfig {
  type: ESupportedPlotlyVis.SCATTER;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  numColorScaleType: ENumericalColorScaleType;
  shape: ColumnInfo | null;
  dragMode: EScatterSelectSettings;
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
  catColumnSelected: ColumnInfo;
  aggregateType: EAggregateTypes;
  aggregateColumn: ColumnInfo | null;
}

export interface IHexbinConfig {
  type: ESupportedPlotlyVis.HEXBIN;
  numColumnsSelected: ColumnInfo[];
  color: ColumnInfo | null;
  hexRadius: number;
  isOpacityScale: boolean;
  isSizeScale: boolean;
  dragMode: EScatterSelectSettings;
  hexbinOptions: EHexbinOptions;
}

type ValueGetter<T> = () => T | Promise<T>;

export interface IVisCommonValue<Type extends number | string> {
  /**
   * Visyn id of the row.
   */
  id: string;
  /**
   * Value of a vis column.
   */
  val: Type;
}

export type VisNumericalValue = IVisCommonValue<number>;

export type VisCategoricalValue = IVisCommonValue<string>;

export interface VisCommonColumn {
  info: ColumnInfo;
  values: ValueGetter<(VisNumericalValue | VisCategoricalValue)[]>;
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
  errorMessageHeader: string;
};

export type PlotlyData = {
  data: Partial<Plotly.PlotData>;
  xLabel: string;
  yLabel: string;
  xTicks?: string[];
  xTickLabels?: string[];
  yTicks?: string[];
  yTickLabels?: string[];
};

export type ColumnInfo = {
  name: string;
  id: string;
  description: string;
};

export type Scales = {
  color: any;
};

/**
 * Common props for all vis sidebars.
 */
export interface ICommonVisSideBarProps {
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
}
