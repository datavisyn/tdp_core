import { CategoricalColumn, IBarConfig, IVisConfig, NumericalColumn, Scales, PlotlyInfo } from '../interfaces';
export declare function isBar(s: IVisConfig): s is IBarConfig;
export declare function barMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IBarConfig): IVisConfig;
export declare function createBarTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IBarConfig, scales: Scales): PlotlyInfo;
//# sourceMappingURL=utils.d.ts.map