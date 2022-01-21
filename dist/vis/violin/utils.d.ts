import { PlotlyInfo, ColumnInfo, ESupportedPlotlyVis, IVisConfig, Scales, VisColumn } from '../interfaces';
import { EViolinOverlay } from '../bar/utils';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}
export declare function violinMergeDefaultConfig(columns: VisColumn[], config: IViolinConfig): IVisConfig;
export declare function createViolinTraces(columns: VisColumn[], config: IViolinConfig, scales: Scales): Promise<PlotlyInfo>;
