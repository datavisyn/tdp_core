import { PlotlyInfo, ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisColumn } from '../interfaces';
export declare function isPCP(s: IVisConfig): s is IPCPConfig;
export interface IPCPConfig {
    type: ESupportedPlotlyVis.PCP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function pcpMergeDefaultConfig(columns: VisColumn[], config: IPCPConfig): IVisConfig;
export declare function createPCPTraces(columns: VisColumn[], config: IPCPConfig): Promise<PlotlyInfo>;
