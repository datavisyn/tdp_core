import { Range, RangeLike } from '../range';
import { IValueTypeDesc } from '../data';
import { IHistogram } from '../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../base/statistics';
import { IDType, ProductIDType } from '../idtype';
import { IMatrix, IMatrixDataDescription, IHeatMapUrlOptions } from './IMatrix';
import { AMatrix } from './AMatrix';
import { IMatrixLoader, IMatrixLoader2 } from './loader';
export interface IAsMatrixOptions {
    name?: string;
    rowtype?: string;
    coltype?: string;
    rowassigner?(ids: string[]): Range;
    colassigner?(ids: string[]): Range;
}
/**
 * Base matrix implementation holding the data
 */
export declare class Matrix<T, D extends IValueTypeDesc> extends AMatrix<T, D> {
    readonly desc: IMatrixDataDescription<D>;
    private loader;
    readonly t: IMatrix<T, D>;
    readonly valuetype: D;
    readonly rowtype: IDType;
    readonly coltype: IDType;
    private _producttype;
    constructor(desc: IMatrixDataDescription<D>, loader: IMatrixLoader2<T>);
    get producttype(): ProductIDType;
    get idtypes(): IDType[];
    /**
     * access at a specific position
     * @param i
     * @param j
     * @returns {*}
     */
    at(i: number, j: number): Promise<T>;
    data(range?: RangeLike): Promise<T[][]>;
    ids(range?: RangeLike): Promise<Range>;
    /**
     * return the column ids of the matrix
     * @returns {*}
     */
    cols(range?: RangeLike): Promise<string[]>;
    colIds(range?: RangeLike): Promise<Range>;
    /**
     * return the row ids of the matrix
     * @returns {*}
     */
    rows(range?: RangeLike): Promise<string[]>;
    rowIds(range?: RangeLike): Promise<Range>;
    hist(bins?: number, range?: RangeLike, containedIds?: number): Promise<IHistogram>;
    stats(range?: RangeLike): Promise<IStatistics>;
    statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;
    size(): [number, number];
    persist(): string;
    heatmapUrl(range?: Range, options?: IHeatMapUrlOptions): string;
    /**
     * module entry point for creating a datatype
     * @param desc
     * @param loader
     * @returns {IMatrix}
     */
    static create<T, D extends IValueTypeDesc>(desc: IMatrixDataDescription<D>, loader?: IMatrixLoader2<T> | IMatrixLoader<T>): IMatrix<T, D>;
    static asMatrix<T>(data: T[][], options?: IAsMatrixOptions): IMatrix<T, IValueTypeDesc>;
    static asMatrix<T>(data: T[][], rows: string[], cols: string[]): IMatrix<T, IValueTypeDesc>;
    static asMatrix<T>(data: T[][], rows: string[], cols: string[], options?: IAsMatrixOptions): IMatrix<T, IValueTypeDesc>;
}
