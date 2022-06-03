import { Plotly } from './Plot';

export enum ESupportedPlotlyVis {
  SCATTER = 'Scatter Plot',
  PCP = 'Parallel Coordinates Plot',
  VIOLIN = 'Violin Plot',
  STRIP = 'Strip Plot',
  BAR = 'Bar Chart',
  SANKEY = 'Sankey',
}

export enum EBarDisplayType {
  ABSOLUTE = 'Absolute',
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

export interface IPCPConfig {
  type: ESupportedPlotlyVis.PCP;
  allColumnsSelected: ColumnInfo[];
}

export interface ISankeyConfig {
  type: ESupportedPlotlyVis.SANKEY;
  catColumnsSelected: ColumnInfo[];
}

export type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig | ISankeyConfig;

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
export interface ICommonVisSideBarProps<T extends IVisConfig> {
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
  config: T;
  setConfig: (config: T) => void;
  columns: VisColumn[];
  filterCallback?: (s: EFilterOptions) => void;
}

export interface ICommonVisProps<T extends IVisConfig> {
  config: T;
  setConfig: (config: T) => void;
  columns: VisColumn[];
  optionsConfig: any;
  shapes: string[];
  filterCallback: (s: EFilterOptions) => void;
  selectionCallback: (s: string[]) => void;
  selectedMap: { [key: string]: boolean };
  selectedList: string[];
  hideSidebar: boolean;
  showCloseButton: boolean;
  closeButtonCallback: () => void;
  scales: Scales;
}
