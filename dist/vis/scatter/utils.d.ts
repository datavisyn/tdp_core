import { CategoricalColumn, IScatterConfig, IVisConfig, NumericalColumn, PlotlyInfo, Scales } from '../interfaces';
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export declare function scatterMergeDefaultConfig(columns: (NumericalColumn | CategoricalColumn)[], config: IScatterConfig): IVisConfig;
export declare function createScatterTraces(columns: (NumericalColumn | CategoricalColumn)[], selected: {
    [key: number]: boolean;
}, config: IScatterConfig, scales: Scales, shapes: string[] | null): PlotlyInfo;
//# sourceMappingURL=utils.d.ts.map