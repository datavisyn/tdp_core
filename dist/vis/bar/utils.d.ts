import { VisCategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
export declare enum EBarDisplayType {
    DEFAULT = "Default",
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
export declare enum EBarGroupingType {
    STACK = "Stacked",
    GROUP = "Grouped"
}
export declare function isBar(s: IVisConfig): s is IBarConfig;
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
export declare function barMergeDefaultConfig(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IBarConfig): IVisConfig;
export declare function createBarTraces(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IBarConfig, scales: Scales): PlotlyInfo;
