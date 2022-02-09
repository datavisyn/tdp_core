import { CategoricalColumn, IPCPConfig, IVisConfig, NumericalColumn, PlotlyInfo } from '../interfaces';
export declare function isPCP(s: IVisConfig): s is IPCPConfig;
export declare function pcpMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IPCPConfig): IVisConfig;
export declare function createPCPTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IPCPConfig): PlotlyInfo;
//# sourceMappingURL=utils.d.ts.map