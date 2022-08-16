import { PlotlyInfo, IVisConfig, Scales, VisColumn, IViolinConfig } from '../interfaces';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export declare function violinMergeDefaultConfig(columns: VisColumn[], config: IViolinConfig): IVisConfig;
export declare function createViolinTraces(columns: VisColumn[], config: IViolinConfig, scales: Scales): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map