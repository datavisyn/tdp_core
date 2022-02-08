import { PlotlyInfo, IVisConfig, Scales, VisColumn, IBarConfig } from '../interfaces';
export declare function isBar(s: IVisConfig): s is IBarConfig;
export declare function barMergeDefaultConfig(columns: VisColumn[], config: IBarConfig): IVisConfig;
export declare function createBarTraces(columns: VisColumn[], config: IBarConfig, scales: Scales): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map