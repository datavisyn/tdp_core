import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function stripInit(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig, scales: Scales): PlotlyInfo;
