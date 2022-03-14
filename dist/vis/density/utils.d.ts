import { EColumnTypes, IVisConfig, VisColumn, IDensityConfig, VisNumericalValue, VisCategoricalValue, ColumnInfo } from '../interfaces';
export declare function isDensity(s: IVisConfig): s is IDensityConfig;
export declare function densityMergeDefaultConfig(columns: VisColumn[], config: IDensityConfig): IVisConfig;
export declare function getHexData(columns: VisColumn[], numColumnsSelected: ColumnInfo[], colorColumn: ColumnInfo | null): Promise<{
    numColVals: {
        resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
        type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
        info: ColumnInfo;
    }[];
    colorColVals: {
        resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
        type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
        info: ColumnInfo;
    };
}>;
export declare function cutHex(path: string, radius: number, start: number, sixths: number): string;
//# sourceMappingURL=utils.d.ts.map