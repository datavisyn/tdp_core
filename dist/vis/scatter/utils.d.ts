import { VisNumericalColumn, VisCategoricalColumn, ColumnInfo, IVisConfig, Scales, ESupportedPlotlyVis } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
export declare enum ENumericalColorScaleType {
    SEQUENTIAL = "Sequential",
    DIVERGENT = "Divergent"
}
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export interface IScatterConfig {
    type: ESupportedPlotlyVis.SCATTER;
    numColumnsSelected: ColumnInfo[];
    color: ColumnInfo | null;
    numColorScaleType: ENumericalColorScaleType;
    shape: ColumnInfo | null;
    isRectBrush: boolean;
    alphaSliderVal: number;
}
export declare function scatterMergeDefaultConfig(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IScatterConfig): IVisConfig;
export declare function createScatterTraces(columns: (VisNumericalColumn | VisCategoricalColumn)[], selected: {
    [key: number]: boolean;
}, config: IScatterConfig, scales: Scales, shapes: string[] | null): PlotlyInfo;
