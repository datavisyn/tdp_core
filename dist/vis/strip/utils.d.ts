import { PlotlyInfo, ColumnInfo, ESupportedPlotlyVis, IVisConfig, Scales, VisColumn } from '../interfaces';
export declare function isStrip(s: IVisConfig): s is IStripConfig;
export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}
export declare function stripMergeDefaultConfig(columns: VisColumn[], config: IStripConfig): IVisConfig;
export declare function createStripTraces(columns: VisColumn[], config: IStripConfig, scales: Scales): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map