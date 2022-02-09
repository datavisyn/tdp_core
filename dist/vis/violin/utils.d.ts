import { CategoricalColumn, IViolinConfig, IVisConfig, NumericalColumn, Scales, PlotlyInfo } from '../interfaces';
export declare function isViolin(s: IVisConfig): s is IViolinConfig;
export declare function violinMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig): IVisConfig;
export declare function createViolinTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig, scales: Scales): PlotlyInfo;
//# sourceMappingURL=utils.d.ts.map