import { CategoricalColumn, IStripConfig, IVisConfig, NumericalColumn, Scales, PlotlyInfo } from '../interfaces';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export declare function stripMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig, scales: Scales): PlotlyInfo;
//# sourceMappingURL=utils.d.ts.map