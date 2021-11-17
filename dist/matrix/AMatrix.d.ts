import { IPersistable } from '../base/IPersistable';
import { RangeLike, Range } from '../range';
import { IDType } from '../idtype/IDType';
import { AProductSelectAble } from '../idtype/AProductSelectAble';
import { IValueTypeDesc } from '../data';
import { IVector } from '../vector';
import { IHistogram } from '../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../base/statistics';
import { IMatrix, IHeatMapUrlOptions } from './IMatrix';
/**
 * base class for different Matrix implementations, views, transposed,...
 */
export declare abstract class AMatrix<T, D extends IValueTypeDesc> extends AProductSelectAble {
    protected root: IMatrix<T, D>;
    static IDTYPE_ROW: number;
    static IDTYPE_COLUMN: number;
    static IDTYPE_CELL: number;
    static DIM_ROW: number;
    static DIM_COL: number;
    constructor(root: IMatrix<T, D>);
    abstract size(): number[];
    abstract data(range?: RangeLike): Promise<T[][]>;
    abstract t: IMatrix<T, D>;
    get dim(): number[];
    get length(): number;
    get nrow(): number;
    get ncol(): number;
    get indices(): Range;
    view(range?: RangeLike): IMatrix<T, D>;
    slice(col: number): IVector<T, D>;
    stats(range?: RangeLike): Promise<IStatistics>;
    statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;
    hist(bins?: number, range?: RangeLike, containedIds?: number): Promise<IHistogram>;
    idView(idRange?: RangeLike): Promise<IMatrix<T, D>>;
    reduce<U, UD extends IValueTypeDesc>(f: (row: T[]) => U, thisArgument?: any, valuetype?: UD, idtype?: IDType): IVector<U, UD>;
    restore(persisted: any): IPersistable;
}
/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
export declare class MatrixView<T, D extends IValueTypeDesc> extends AMatrix<T, D> {
    private range;
    readonly t: IMatrix<T, D>;
    constructor(root: IMatrix<T, D>, range: Range, t?: IMatrix<T, D>);
    get desc(): import("./IMatrix").IMatrixDataDescription<D>;
    persist(): {
        root: any;
        range: string;
    };
    ids(range?: RangeLike): Promise<Range>;
    cols(range?: RangeLike): Promise<string[]>;
    colIds(range?: RangeLike): Promise<Range>;
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    size(): number[];
    at(i: number, j: number): Promise<T>;
    data(range?: RangeLike): Promise<T[][]>;
    hist(bins?: number, range?: RangeLike, containedIds?: number): Promise<IHistogram>;
    stats(range?: RangeLike): Promise<IStatistics>;
    statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;
    heatmapUrl(range?: Range, options?: IHeatMapUrlOptions): string;
    view(range?: RangeLike): MatrixView<T, D>;
    get valuetype(): D;
    get rowtype(): IDType;
    get coltype(): IDType;
    get producttype(): import("../idtype").ProductIDType;
    get idtypes(): IDType[];
}
