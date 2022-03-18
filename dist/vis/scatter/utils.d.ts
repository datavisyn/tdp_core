import { PlotlyInfo, IVisConfig, Scales, VisColumn, IScatterConfig } from '../interfaces';
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export declare function scatterMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig;
export declare function createScatterTraces(columns: VisColumn[], selected: {
    [id: string]: boolean;
}, config: IScatterConfig, scales: Scales, shapes: string[] | null): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map