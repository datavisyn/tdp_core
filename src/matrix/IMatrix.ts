import {RangeLike} from '../range';
import {Range} from '../range/Range';
import {IProductSelectAble} from '../idtype';
import {IDType} from '../idtype/IDType';
import {
  IHistAbleDataType, IValueTypeDesc, IDataDescription, DataUtils,
  INumberValueTypeDesc, ICategoricalValueTypeDesc, IStatsAbleDataType
} from '../data';
import {IVector} from '../vector';
import {IHistogram} from '../data/histogram';
import {IAdvancedStatistics, IStatistics} from '../base/statistics';
import {BaseUtils} from '../base/BaseUtils';


export interface IHeatMapUrlOptions {
  format?: string;
  transpose?: boolean;
  range?: [number, number];
  palette?: string;
  missing?: string;
}

export interface IHeatMapUrlParameter {
  format: string;
  range: string;
  format_transpose?: boolean;
  format_min?: number;
  format_max?: number;
  format_palette?: string;
  format_missing?: string;
}

export interface IMatrixDataDescription<D extends IValueTypeDesc> extends IDataDescription {
  loadAtOnce?: boolean;
  value: D;
  rowtype: string;
  coltype: string;
  /**
   * nrow, ncol
   */
  size: [number, number];
}

export interface IMatrix<T, D extends IValueTypeDesc> extends IHistAbleDataType<D>, IProductSelectAble, IStatsAbleDataType<D> {
  readonly desc: IMatrixDataDescription<D>;
  /**
   * number of rows
   */
  readonly nrow: number;
  /**
   * number of cols
   */
  readonly ncol: number;

  /**
   * row id type
   */
  readonly rowtype: IDType;

  /**
   * column id type
   */
  readonly coltype: IDType;

  /**
   * creates a new view on this matrix specified by the given range
   * @param range
   */
  view(range?: RangeLike): IMatrix<T,D>;


  idView(idRange?: RangeLike): Promise<IMatrix<T,D>>;

  slice(col: number): IVector<T,D>;

  //view(filter: string): Promise<IMatrix>;

  /**
   * reduces the current matrix to a vector using the given reduce function
   * @param f the reduce function
   * @param thisArgument the this context for the function default the matrix
   * @param valuetype the new value type by default the same as matrix valuetype
   * @param idtype the new vlaue type by default the same as matrix rowtype
   */
  reduce<U, UD extends IValueTypeDesc>(f: (row: T[]) => U, thisArgument?: any, valuetype?: UD, idtype?: IDType): IVector<U, UD>;
  /**
   * transposed version of this matrix
   */
  readonly t: IMatrix<T,D>;
  /**
   * returns a promise for getting the col names of the matrix
   * @param range
   * @returns {Promise<string[]>}
   */
  cols(range?: RangeLike): Promise<string[]>;

  colIds(range?: RangeLike): Promise<Range>;
  /**
   * returns a promise for getting the row names of the matrix
   * @param range
   */
  rows(range?: RangeLike): Promise<string[]>;

  rowIds(range?: RangeLike): Promise<Range>;

  /**
   * returns a promise for getting one cell
   * @param i
   * @param j
   */
  at(i: number, j: number): Promise<T>;
  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  data(range?: RangeLike): Promise<T[][]>;

  stats(range?: RangeLike): Promise<IStatistics>;
  statsAdvanced(range?: RangeLike): Promise<IAdvancedStatistics>;

  hist(bins?: number, range?: RangeLike, containedIds?: number): Promise<IHistogram>;

  /**
   * generates a server url for creating a heatmap image of this matrix
   * @param range
   * @param options
   * @returns the url or null if no url can be generated
   */
  heatmapUrl(range?: RangeLike, options?: IHeatMapUrlOptions): string;
}

export declare type INumericalMatrix = IMatrix<number, INumberValueTypeDesc>;
export declare type ICategoricalMatrix = IMatrix<number, ICategoricalValueTypeDesc>;
export declare type IAnyMatrix = IMatrix<any, IValueTypeDesc>;

export class MatrixUtils {
  static createDefaultMatrixDesc(): IMatrixDataDescription<IValueTypeDesc> {
    return <IMatrixDataDescription<IValueTypeDesc>>BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
      type: 'matrix',
      rowtype: '_rows',
      coltype: '_cols',
      size: [0, 0]
    });
  }
}
