import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, IVisConfig, NumericalColumn } from '../interfaces';
import { PlotlyInfo } from '../interfaces';
export declare function isPCP(s: IVisConfig): s is IPCPConfig;
export interface IPCPConfig {
    type: ESupportedPlotlyVis.PCP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function pcpInit(columns: (NumericalColumn | CategoricalColumn)[], config: IPCPConfig): IVisConfig;
export declare function createPCPTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IPCPConfig): PlotlyInfo;
