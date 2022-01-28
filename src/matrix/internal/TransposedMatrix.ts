import { RangeLike, Range, ParseRangeUtils } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { DataUtils } from '../../data';
import { IMatrix, IHeatMapUrlOptions } from '../IMatrix';
import { AMatrix, MatrixView } from '../AMatrix';
import { SliceRowVector } from './SliceRowVector';
import { IVector } from '../../vector';
import { IHistogram } from '../../data/histogram';
import { IAdvancedStatistics, IStatistics } from '../../base/statistics';

/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
export class TransposedMatrix<T, D extends IValueTypeDesc> extends AMatrix<T, D> {
  readonly t: IMatrix<T, D>;

  constructor(base: IMatrix<T, D>) {
    super(base);
    this.t = base;
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      transposed: true,
    };
  }

  get valuetype() {
    return this.root.valuetype;
  }

  get rowtype() {
    return this.root.coltype;
  }

  get coltype() {
    return this.root.rowtype;
  }

  get producttype() {
    return this.root.producttype;
  }

  get idtypes() {
    return [this.rowtype, this.coltype];
  }

  async ids(range: RangeLike = Range.all()) {
    const ids = await this.t.ids(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    return ids.swap();
  }

  cols(range: RangeLike = Range.all()): Promise<string[]> {
    return this.t.rows(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  colIds(range: RangeLike = Range.all()) {
    return this.t.rowIds(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  rows(range: RangeLike = Range.all()): Promise<string[]> {
    return this.t.cols(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  rowIds(range: RangeLike = Range.all()) {
    return this.t.colIds(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  view(range: RangeLike = Range.all()): IMatrix<T, D> {
    const r = ParseRangeUtils.parseRangeLike(range);
    if (r.isAll) {
      return this;
    }
    return new MatrixView(this.root, r.swap()).t;
  }

  slice(col: number): IVector<T, D> {
    return new SliceRowVector(this.root, col);
  }

  size() {
    const s = this.t.dim;
    return [s[1], s[0]]; // swap dimension
  }

  at(i: number, j: number) {
    return this.t.at(j, i);
  }

  async data(range: RangeLike = Range.all()) {
    return DataUtils.transpose(await this.t.data(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined));
  }

  hist(bins?: number, range: RangeLike = Range.all(), containedIds = 0): Promise<IHistogram> {
    return this.t.hist(bins, range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined, 1 - containedIds);
  }

  stats(range: RangeLike = Range.all()): Promise<IStatistics> {
    return this.t.stats(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  statsAdvanced(range: RangeLike = Range.all()): Promise<IAdvancedStatistics> {
    return this.t.statsAdvanced(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
  }

  heatmapUrl(range: RangeLike = Range.all(), options: IHeatMapUrlOptions = {}) {
    options.transpose = options.transpose !== true;
    return this.t.heatmapUrl(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined, options);
  }
}
