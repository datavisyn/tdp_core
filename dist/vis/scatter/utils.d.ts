import { PlotlyInfo, IVisConfig, Scales, VisColumn, IScatterConfig, ENumericalColorScaleType, VisCategoricalValue, VisNumericalValue, ColumnInfo } from '../interfaces';
export declare function isScatter(s: IVisConfig): s is IScatterConfig;
export declare function scatterMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig;
export declare function moveSelectedToFront(col: (VisCategoricalValue | VisNumericalValue)[], selectedMap: {
    [key: string]: boolean;
}): (VisCategoricalValue | VisNumericalValue)[];
export declare function createScatterTraces(columns: VisColumn[], numColumnsSelected: ColumnInfo[], shape: ColumnInfo, color: ColumnInfo, alphaSliderVal: number, colorScaleType: ENumericalColorScaleType, scales: Scales, shapes: string[] | null): Promise<PlotlyInfo>;
//# sourceMappingURL=utils.d.ts.map