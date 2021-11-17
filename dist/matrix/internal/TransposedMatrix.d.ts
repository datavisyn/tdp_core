import { RangeLike, Range } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { IMatrix, IHeatMapUrlOptions } from '../IMatrix';
import { AMatrix } from '../AMatrix';
import { IVector } from '../../vector';
import { IHistogram } from '../../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../../base/statistics';
/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
export declare class TransposedMatrix<T, D extends IValueTypeDesc> extends AMatrix<T, D> {
    readonly t: IMatrix<T, D>;
    constructor(base: IMatrix<T, D>);
    get desc(): import("../IMatrix").IMatrixDataDescription<D>;
    persist(): {
        root: any;
        transposed: boolean;
    };
    get valuetype(): D;
    get rowtype(): import("../..").IDType;
    get coltype(): import("../..").IDType;
    get producttype(): import("../..").ProductIDType;
    get idtypes(): import("../..").IDType[];
    ids(range?: RangeLike): Promise<Range>;
    cols(range?: RangeLike): Promise<string[]>;
    colIds(range?: RangeLike): Promise<Range>;
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    view(range?: RangeLike): IMatrix<T, D>;
    slice(col: number): IVector<T, D>;
    size(): number[];
    at(i: number, j: number): Promise<T>;
    data(range?: RangeLike): Promise<any[][]>;
    hist(bins?: number, range?: RangeLike, containedIds?: number): Promise<IHistogram>;
    stats(range?: RangeLike): Promise<IStatistics>;
    statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;
    heatmapUrl(range?: RangeLike, options?: IHeatMapUrlOptions): string;
}
