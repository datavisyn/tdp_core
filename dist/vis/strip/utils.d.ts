import { PlotlyInfo, IVisConfig, Scales, VisColumn, IStripConfig } from '../interfaces';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export declare function stripMergeDefaultConfig(columns: VisColumn[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: VisColumn[], config: IStripConfig, selected: {
    [key: string]: boolean;
}, scales: Scales): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map