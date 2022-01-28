import { ArrayUtils } from '../../base/ArrayUtils';
import { Range, RangeLike, ParseRangeUtils } from '../../range';
import { IValueTypeDesc } from '../../data/valuetype';
import { IVector, IVectorDataDescription } from '../../vector';
import { AVector } from '../../vector/AVector';
import { IMatrix } from '../IMatrix';

/**
 * a simple projection of a matrix columns to a vector
 */
export class ProjectedVector<T, D extends IValueTypeDesc, M, MD extends IValueTypeDesc> extends AVector<T, D> implements IVector<T, D> {
  readonly desc: IVectorDataDescription<D>;

  constructor(
    private m: IMatrix<M, MD>,
    private f: (row: M[]) => T,
    private thisArgument = m,
    public readonly valuetype: D = <any>m.valuetype,
    private _idtype = m.rowtype,
  ) {
    super(null);
    this.desc = {
      name: `${m.desc.name}-p`,
      fqname: `${m.desc.fqname}-p`,
      type: 'vector',
      id: `${m.desc.id}-p`,
      size: this.dim[0],
      idtype: m.rowtype,
      value: this.valuetype,
      description: m.desc.description,
      creator: m.desc.creator,
      ts: m.desc.ts,
    };
    this.root = this;
  }

  persist() {
    return {
      root: this.m.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype === <any>this.m.valuetype ? undefined : this.valuetype,
      idtype: this.idtype === this.m.rowtype ? undefined : this.idtype.name,
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

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this._idtype];
  }

  size() {
    return this.m.nrow;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: RangeLike): Promise<string[]> {
    return this.m.rows(range);
  }

  ids(range?: RangeLike) {
    return this.m.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  async at(i: number): Promise<T> {
    const d = await this.m.data(Range.list(i));
    return this.f.call(this.thisArgument, d[0]);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  async data(range?: RangeLike): Promise<T[]> {
    return (await this.m.data(range)).map(this.f, this.thisArgument);
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
