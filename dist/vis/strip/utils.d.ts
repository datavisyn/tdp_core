import { VisCategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function stripMergeDefaultConfig(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IStripConfig, scales: Scales): PlotlyInfo;
