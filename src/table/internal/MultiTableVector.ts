import {ArrayUtils} from '../../base/ArrayUtils';
import {BaseUtils} from '../../base/BaseUtils';
import {ParseRangeUtils, RangeLike, Range} from '../../range';
import {IValueTypeDesc, IValueType} from '../../data';
import {IVector, IVectorDataDescription} from '../../vector';
import {ITable} from '../ITable';
import {AVector} from '../../vector/AVector';

/**
 * @internal
 */
export class MultiTableVector<T, D extends IValueTypeDesc> extends AVector<T, D> implements IVector<T,D> {
  readonly desc: IVectorDataDescription<D>;

  constructor(private table: ITable, private f: (row: IValueType[]) => T, private thisArgument = table, public readonly valuetype: D = null, private _idtype = table.idtype) {
    super(null);
    this.desc = {
      name: table.desc.name + '-p',
      fqname: table.desc.fqname + '-p',
      description: f.toString(),
      type: 'vector',
      id: BaseUtils.fixId(table.desc.id + '-p' + f.toString()),
      idtype: table.desc.idtype,
      size: table.nrow,
      value: valuetype,
      creator: table.desc.creator,
      ts: Date.now()
    };
    this.root = this;
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist() {
    return {
      root: this.table.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype ? this.valuetype : undefined,
      idtype: this.idtype === this.table.idtype ? undefined : this.idtype.name
    };
  }

  restore(persisted: any) {
    let r: IVector<T,D> = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
    }
    return r;
  }

  size() {
    return this.table.nrow;
  }

  /**
   * return the associated ids of this vector
   */
  names(range?: RangeLike): Promise<string[]> {
    return this.table.rows(range);
  }

  ids(range?: RangeLike) {
    return this.table.rowIds(range);
  }

  /**
   * returns a promise for getting one cell
   * @param i
   */
  async at(i: number): Promise<any> {
    return this.f.call(this.thisArgument, (await this.table.data(Range.list(i)))[0]);
  }

  /**
   * returns a promise for getting the data as two dimensional array
   * @param range
   */
  async data(range?: RangeLike): Promise<T[]> {
    return (await this.table.data(range)).map(this.f, this.thisArgument);
  }

  async sort(compareFn?: (a: T, b: T) => number, thisArg?: any): Promise<IVector<T,D>> {
    const d = await this.data();
    const indices = ArrayUtils.argSort(d, compareFn, thisArg);
    return this.view(Range.list(indices));
  }

  async filter(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<IVector<T,D>> {
    const d = await this.data();
    const indices = ArrayUtils.argFilter(d, callbackfn, thisArg);
    return this.view(Range.list(indices));
  }
}
