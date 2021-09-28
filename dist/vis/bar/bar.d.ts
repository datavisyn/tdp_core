import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales } from '../interfaces';
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
export declare function barInit(columns: (NumericalColumn | CategoricalColumn)[], config: IBarConfig): IVisConfig;
export declare function createBarTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IBarConfig, scales: Scales): PlotlyInfo;
