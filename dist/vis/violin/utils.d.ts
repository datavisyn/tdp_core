import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
import { EViolinOverlay } from '../bar/utils';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}
export declare function violinInit(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig): IVisConfig;
export declare function createViolinTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig, scales: Scales): PlotlyInfo;
