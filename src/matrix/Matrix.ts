import { Range, RangeLike, ParseRangeUtils } from '../range';
import { IValueTypeDesc, ValueTypeUtils } from '../data';
import { IHistogram } from '../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../base/statistics';
import { BaseUtils } from '../base/BaseUtils';
import { IDType, ProductIDType, IDTypeManager, LocalIDAssigner } from '../idtype';
import { IMatrix, IMatrixDataDescription, IHeatMapUrlOptions, MatrixUtils } from './IMatrix';
import { AMatrix } from './AMatrix';
import { TransposedMatrix } from './internal/TransposedMatrix';
import { IMatrixLoader, IMatrixLoader2, MatrixLoaderHelper } from './loader';

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
export class Matrix<T, D extends IValueTypeDesc> extends AMatrix<T, D> {
  readonly t: IMatrix<T, D>;

  readonly valuetype: D;

  readonly rowtype: IDType;

  readonly coltype: IDType;

  private _producttype: ProductIDType;

  constructor(public readonly desc: IMatrixDataDescription<D>, private loader: IMatrixLoader2<T>) {
    super(null);
    this.root = this;
    this.valuetype = desc.value;
    this.rowtype = IDTypeManager.getInstance().resolveIdType(desc.rowtype);
    this.coltype = IDTypeManager.getInstance().resolveIdType(desc.coltype);
    this._producttype = IDTypeManager.getInstance().resolveProduct(this.rowtype, this.coltype);
    this.t = new TransposedMatrix(this);
  }

  get producttype() {
    return this._producttype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  /**
   * access at a specific position
   * @param i
   * @param j
   * @returns {*}
   */
  at(i: number, j: number) {
    return this.loader.at(this.desc, i, j);
  }

  data(range: RangeLike = Range.all()) {
    return this.loader.data(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  ids(range: RangeLike = Range.all()) {
    return this.loader.ids(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  /**
   * return the column ids of the matrix
   * @returns {*}
   */
  cols(range: RangeLike = Range.all()): Promise<string[]> {
    return this.loader.cols(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  colIds(range: RangeLike = Range.all()) {
    return this.loader.colIds(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  /**
   * return the row ids of the matrix
   * @returns {*}
   */
  rows(range: RangeLike = Range.all()): Promise<string[]> {
    return this.loader.rows(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  rowIds(range: RangeLike = Range.all()) {
    return this.loader.rowIds(this.desc, ParseRangeUtils.parseRangeLike(range));
  }

  hist(bins?: number, range: RangeLike = Range.all(), containedIds = 0): Promise<IHistogram> {
    if (this.loader.numericalHist && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
      // use loader for hist
      return this.loader.numericalHist(this.desc, ParseRangeUtils.parseRangeLike(range), bins);
    }
    // compute
    return super.hist(bins, range, containedIds);
  }

  stats(range: RangeLike = Range.all()): Promise<IStatistics> {
    if (this.loader.numericalStats && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
      // use loader for hist
      return this.loader.numericalStats(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    // compute
    return super.stats(range);
  }

  statsAdvanced(range: RangeLike = Range.all()): Promise<IAdvancedStatistics> {
    if (this.loader.numericalStats && (this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
      // use loader for hist
      return this.loader.numericalStats(this.desc, ParseRangeUtils.parseRangeLike(range));
    }
    // compute
    return super.statsAdvanced(range);
  }

  size() {
    return this.desc.size;
  }

  persist() {
    return this.desc.id;
  }

  heatmapUrl(range = Range.all(), options: IHeatMapUrlOptions = {}) {
    if (this.loader.heatmapUrl) {
      return this.loader.heatmapUrl(this.desc, range, options);
    }
    return null;
  }

  /**
   * module entry point for creating a datatype
   * @param desc
   * @param loader
   * @returns {IMatrix}
   */
  static create<T, D extends IValueTypeDesc>(desc: IMatrixDataDescription<D>, loader?: IMatrixLoader2<T> | IMatrixLoader<T>): IMatrix<T, D> {
    if (typeof loader === 'function') {
      return new Matrix(desc, MatrixLoaderHelper.adapterOne2Two(<IMatrixLoader<T>>loader));
    }
    return new Matrix(desc, loader ? <IMatrixLoader2<T>>loader : MatrixLoaderHelper.viaAPI2Loader());
  }

  static asMatrix<T>(data: T[][], options?: IAsMatrixOptions): IMatrix<T, IValueTypeDesc>;
  static asMatrix<T>(data: T[][], rows: string[], cols: string[]): IMatrix<T, IValueTypeDesc>;
  static asMatrix<T>(data: T[][], rows: string[], cols: string[], options?: IAsMatrixOptions): IMatrix<T, IValueTypeDesc>;

  /**
   * parses a given dataset and convert is to a matrix
   * @param data the data array
   * @param rowsIdsOrOptions see options or the row ids of this matrix
   * @param colIds the optional column ids
   * @param options options for defining the dataset description
   * @returns {IMatrix}
   */
  static asMatrix<T>(data: T[][], rowsIdsOrOptions?: any, colIds?: string[], options: IAsMatrixOptions = {}): IMatrix<T, IValueTypeDesc> {
    // first column if not defined, excluding 0,0
    const rows = Array.isArray(rowsIdsOrOptions) ? <string[]>rowsIdsOrOptions : data.map((r) => r[0]).slice(1);
    // first row if not defined, excluding 0,0
    const cols = colIds || data[0].slice(1);
    if (typeof rowsIdsOrOptions === 'object') {
      options = rowsIdsOrOptions;
    }
    options = options || {};

    let realData: any[] = Array.isArray(rowsIdsOrOptions) ? data : data.slice(1).map((r) => r.slice(1));
    const valueType = ValueTypeUtils.guessValueTypeDesc([].concat.apply([], realData));

    if (valueType.type === ValueTypeUtils.VALUE_TYPE_REAL) {
      realData = realData.map((row) => row.map(<any>parseFloat));
    } else if (valueType.type === ValueTypeUtils.VALUE_TYPE_INT) {
      realData = realData.map((row) => row.map(<any>parseInt));
    }

    const desc = BaseUtils.mixin(
      MatrixUtils.createDefaultMatrixDesc(),
      {
        size: [rows.length, cols.length],
        value: valueType,
      },
      options,
    );

    const rowAssigner = options.rowassigner || LocalIDAssigner.create();
    const colAssigner = options.rowassigner || LocalIDAssigner.create();
    const loader: IMatrixLoader2<any> = {
      rowIds: (d: IMatrixDataDescription<any>, range: Range) => Promise.resolve(rowAssigner(range.filter(rows))),
      colIds: (d: IMatrixDataDescription<any>, range: Range) => Promise.resolve(colAssigner(range.filter(cols))),
      ids: (d: IMatrixDataDescription<any>, range: Range) => {
        const rc = rowAssigner(range.dim(0).filter(rows));
        const cc = colAssigner(range.dim(1).filter(cols));
        return Promise.resolve(Range.join(rc, cc));
      },
      at: (d: IMatrixDataDescription<any>, i, j) => Promise.resolve(realData[i][j]),
      rows: (d: IMatrixDataDescription<any>, range: Range) => Promise.resolve(range.filter(rows)),
      cols: (d: IMatrixDataDescription<any>, range: Range) => Promise.resolve(range.filter(cols)),
      data: (d: IMatrixDataDescription<any>, range: Range) => Promise.resolve(range.filter(realData)),
    };
    return new Matrix(desc, loader);
  }
}
