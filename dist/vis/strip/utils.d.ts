import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function stripMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig, scales: Scales): PlotlyInfo;
