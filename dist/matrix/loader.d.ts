import { Range } from '../range';
import { IHistogram } from '../data/histogram';
import { IAdvancedStatistics } from '../base/statistics';
import { IMatrixDataDescription, IHeatMapUrlOptions, IHeatMapUrlParameter } from './IMatrix';
export interface IMatrixLoader<T> {
    (desc: IMatrixDataDescription<any>): Promise<{
        rowIds: Range;
        rows: string[];
        colIds: Range;
        cols: string[];
        ids: Range;
        data: T[][];
    }>;
}
export interface IMatrixLoader2<T> {
    rowIds(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
    rows(desc: IMatrixDataDescription<any>, range: Range): Promise<string[]>;
    colIds(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
    cols(desc: IMatrixDataDescription<any>, range: Range): Promise<string[]>;
    ids(desc: IMatrixDataDescription<any>, range: Range): Promise<Range>;
    at(desc: IMatrixDataDescription<any>, i: number, j: number): Promise<T>;
    data(desc: IMatrixDataDescription<any>, range: Range): Promise<T[][]>;
    numericalHist?(desc: IMatrixDataDescription<any>, range: Range, bins?: number): Promise<IHistogram>;
    numericalStats?(desc: IMatrixDataDescription<any>, range: Range): Promise<IAdvancedStatistics>;
    heatmapUrl?(desc: IMatrixDataDescription<any>, range: Range, options: IHeatMapUrlOptions): string;
}
export declare class MatrixLoaderHelper {
    static adapterOne2Two<T>(loader: IMatrixLoader<T>): IMatrixLoader2<T>;
    static maskIt(desc: IMatrixDataDescription<any>): (v: number | number[]) => number | number[];
    static viaAPI2Loader(): IMatrixLoader2<any>;
    /**
     * Prepare the URL Parameters to load the Heatmap with the given range and options
     * @param range range for the subset of the matrix
     * @param options options for the URL configuration
     */
    static prepareHeatmapUrlParameter(range: Range, options: IHeatMapUrlOptions): IHeatMapUrlParameter;
}
//# sourceMappingURL=loader.d.ts.map