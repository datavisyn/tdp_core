import { ArrayUtils } from '../../base/ArrayUtils';
import { RangeLike, Range, ParseRangeUtils, Range1D } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { IVector, IVectorDataDescription } from '../../vector';
import { AVector } from '../../vector/AVector';
import { IMatrix } from '../IMatrix';

/**
 * a simple projection of a matrix columns to a vector
 */
export class SliceColVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
  readonly desc: IVectorDataDescription<D>;

  private colRange: Range1D;

  constructor(private m: IMatrix<T, D>, private col: number) {
    super(null);
    this.colRange = Range1D.from([this.col]);
    this.desc = {
      name: `${m.desc.name}-c${col}`,
      fqname: `${m.desc.fqname}-c${col}`,
      id: `${m.desc.id}-c${col}`,
      type: 'vector',
      idtype: m.rowtype,
      size: m.nrow,
      value: m.valuetype,
      description: m.desc.description,
      creator: m.desc.creator,
      ts: m.desc.ts,
    };
    this.root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      col: this.col,
    };
  }

  restore(persisted: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let r: IVector<T, D> = this;
    if (persisted && persisted.range) {
      // some view onto it
      r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
    }
    return r;
  }

  get valuetype() {
    return this.m.valuetype;
  }

  get idtype() {
    return this.m.rowtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.m.nrow;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: Range): Promise<string[]> {
    return this.m.rows(range);
  }

  ids(range?: RangeLike) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<T> {
    return this.m.at(i, this.col);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  async data(range: RangeLike = Range.all()): Promise<T[]> {
    const rr = ParseRangeUtils.parseRangeLike(range);
    const r = Range.list(rr.dim(0), this.colRange);
    const d = await this.m.data(r);
    if (d.length === 0) {
      return [];
    }
    if (Array.isArray(d[0])) {
      return d.map((di) => di[0]);
    }
    return <any>d;
  }

  async sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T, D>> {
    const d = await this.data();
    const indices = ArrayUtils.argSort(d, compareFn, thisArg);
    return this.view(Range.list(indices));
  }

  async filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T, D>> {
    const d = await this.data();
    const indices = ArrayUtils.argFilter(d, callbackfn, thisArg);
    return this.view(Range.list(indices));
  }
}
