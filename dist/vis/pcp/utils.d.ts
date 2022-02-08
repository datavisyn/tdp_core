import { PlotlyInfo, IVisConfig, VisColumn, IPCPConfig } from '../interfaces';
export declare function isPCP(s: IVisConfig): s is IPCPConfig;
export declare function pcpMergeDefaultConfig(columns: VisColumn[], config: IPCPConfig): IVisConfig;
export declare function createPCPTraces(columns: VisColumn[], config: IPCPConfig): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map