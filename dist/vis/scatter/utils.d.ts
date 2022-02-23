import { PlotlyInfo, IVisConfig, Scales, VisColumn, IScatterConfig, VisCategoricalValue, VisCategoricalColumn } from '../interfaces';
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export declare function scatterMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig;
export declare function moveSelectedToFront(col: VisCategoricalValue | VisCategoricalColumn, selectedMap: {
    [key: string]: boolean;
}): void;
export declare function createScatterTraces(columns: VisColumn[], selected: string[], config: IScatterConfig, scales: Scales, shapes: string[] | null): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map