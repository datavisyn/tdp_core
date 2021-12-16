import { VisCategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
import { EViolinOverlay } from '../bar/utils';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}
export declare function violinMergeDefaultConfig(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IViolinConfig): IVisConfig;
export declare function createViolinTraces(columns: (VisNumericalColumn | VisCategoricalColumn)[], config: IViolinConfig, scales: Scales): PlotlyInfo;
