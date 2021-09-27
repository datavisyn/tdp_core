import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
import { EViolinOverlay } from './bar';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}
export declare function violinInit(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig, setConfig: (config: IVisConfig) => void): void;
export declare function createViolinTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig, scales: Scales): PlotlyInfo;
