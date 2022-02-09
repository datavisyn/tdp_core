import { ArrayUtils } from '../../base/ArrayUtils';
import { RangeLike, Range, ParseRangeUtils, Range1D } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { IVector, IVectorDataDescription } from '../../vector';
import { AVector } from '../../vector/AVector';
import { IMatrix } from '../IMatrix';

/**
 * a simple projection of a matrix columns to a vector
 */
export class SliceRowVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
  readonly desc: IVectorDataDescription<D>;

  private rowRange: Range1D;

  constructor(private m: IMatrix<T, D>, private row: number) {
    super(null);
    this.rowRange = Range1D.from([this.row]);
    this.desc = {
      name: `${m.desc.name}-r${row}`,
      fqname: `${m.desc.fqname}-r${row}`,
      id: `${m.desc.id}-r${row}`,
      type: 'vector',
      idtype: m.coltype,
      size: m.ncol,
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
      row: this.row,
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
    return this.m.coltype;
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.m.ncol;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: RangeLike): Promise<string[]> {
    return this.m.cols(range);
  }

  ids(range?: RangeLike) {
    return this.m.colIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  at(i: number): Promise<T> {
    return this.m.at(this.row, i);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  async data(range: RangeLike = Range.all()): Promise<T[]> {
    const rr = ParseRangeUtils.parseRangeLike(range);
    const r = Range.list(this.rowRange, rr.dim(0));
    const d = await this.m.data(r);
    return d[0];
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
