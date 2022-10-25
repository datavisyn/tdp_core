/// <reference types="react" />
import type { Plotly } from './Plot';
export declare enum ESupportedPlotlyVis {
    SCATTER = "Scatter Plot",
    PCP = "Parallel Coordinates Plot",
    VIOLIN = "Violin Plot",
    STRIP = "Strip Plot",
    BAR = "Bar Chart"
}
export declare const allVisTypes: ESupportedPlotlyVis[];
export declare enum EBarDisplayType {
    ABSOLUTE = "Absolute",
    NORMALIZED = "Normalized"
}
export declare enum EBarDirection {
    VERTICAL = "Vertical",
    HORIZONTAL = "Horizontal"
}
export declare enum EViolinOverlay {
    NONE = "None",
    STRIP = "Strip",
    BOX = "Box"
}
export declare enum EAggregateTypes {
    COUNT = "Count",
    MIN = "Minimum",
    AVG = "Average",
    MED = "Median",
    MAX = "Maximum"
}
export declare enum EBarGroupingType {
    STACK = "Stacked",
    GROUP = "Grouped"
}
export declare enum EColumnTypes {
    NUMERICAL = "Numerical",
    CATEGORICAL = "Categorical"
}
export declare enum EGeneralFormType {
    DROPDOWN = "Dropdown",
    BUTTON = "Button",
    SLIDER = "Slider"
}
export declare enum EFilterOptions {
    IN = "Filter In",
    OUT = "Filter Out",
    CLEAR = "Clear"
}
export declare enum ENumericalColorScaleType {
    SEQUENTIAL = "Sequential",
    DIVERGENT = "Divergent"
}
export declare enum EScatterSelectSettings {
    RECTANGLE = "select",
    LASSO = "lasso",
    ZOOM = "zoom",
    PAN = "pan"
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
export declare type IVisConfig = IScatterConfig | IViolinConfig | IBarConfig | IStripConfig | IPCPConfig;
declare type ValueGetter<T> = () => T | Promise<T>;
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
export declare type VisNumericalValue = IVisCommonValue<number>;
export declare type VisCategoricalValue = IVisCommonValue<string>;
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
export declare type VisColumn = VisNumericalColumn | VisCategoricalColumn;
export declare type PlotlyInfo = {
    plots: PlotlyData[];
    legendPlots: PlotlyData[];
    rows: number;
    cols: number;
    errorMessage: string;
    errorMessageHeader: string;
};
export declare type PlotlyData = {
    data: Partial<Plotly.PlotData>;
    xLabel: string;
    yLabel: string;
    xTicks?: string[];
    xTickLabels?: string[];
    yTicks?: string[];
    yTickLabels?: string[];
};
export declare type ColumnInfo = {
    name: string;
    id: string;
    description: string;
};
export declare type Scales = {
    color: any;
};
/**
 * Common props for all vis sidebars.
 */
export interface ICommonVisSideBarProps {
    style?: React.CSSProperties | undefined;
    className?: string | undefined;
}
export {};
//# sourceMappingURL=interfaces.d.ts.map