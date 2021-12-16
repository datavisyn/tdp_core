
import {BaseUtils} from '../base/BaseUtils';
import {ArrayUtils} from '../base/ArrayUtils';
import {Range, RangeLike, ParseRangeUtils} from '../range';
import {IDTypeManager, LocalIDAssigner} from '../idtype';
import {
  ValueTypeUtils,
  INumberValueTypeDesc,
  IValueTypeDesc
} from '../data';
import {IVector, IVectorDataDescription} from './IVector';
import {VectorUtils} from './VectorUtils';
import {AVector} from './AVector';
import {IVectorLoader, VectorLoaderUtils, IVectorLoaderResult} from './loader';


export interface IAsVectorOptions {
  name?: string;
  idtype?: string;
  rowassigner?(ids: string[]): Range;
}

/**
 * Base vector implementation holding the data.
 * @internal
 */
export class Vector<T,D extends IValueTypeDesc> extends AVector<T,D> {

  constructor(public readonly desc: IVectorDataDescription<D>, private loader: IVectorLoader<T>) {
    super(null);
    this.root = this;
  }

  get valuetype() {
    return this.desc.value;
  }

  get idtype() {
    return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
  }

  /**
   * loads all the underlying data in json format
   * TODO: load just needed data and not everything given by the requested range
   * @returns {*}
   */
  private load(): Promise<IVectorLoaderResult<T>> {
    return this.loader(this.desc);
  }

  /**
   * access at a specific position
   * @param i
   * @returns {*}
   */
  async at(i: number) {
    return (await this.load()).data[i];
  }

  async data(range: RangeLike = Range.all()) {
    const data = await this.load();
    const d = ParseRangeUtils.parseRangeLike(range).filter(data.data, this.dim);
    if ((this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
      return ValueTypeUtils.mask(d, <INumberValueTypeDesc><any>this.valuetype);
    }
    return d;
  }

  async names(range: RangeLike = Range.all()) {
    const data = await this.load();
    return ParseRangeUtils.parseRangeLike(range).filter(data.rows, this.dim);
  }

  async ids(range: RangeLike = Range.all()): Promise<Range> {
    const data = await this.load();
    return data.rowIds.preMultiply(ParseRangeUtils.parseRangeLike(range), this.dim);
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.desc.size;
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

  persist() {
    return this.desc.id;
  }

  /**
   * module entry point for creating a datatype
   * @internal
   * @param desc
   * @returns {IVector}
   */
  public static create<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>): IVector<T,D> {
    if (typeof((<any>desc).loader) === 'function') {
      return new Vector(desc, <IVectorLoader<T>>(<any>desc).loader);
    }
    return new Vector(desc, VectorLoaderUtils.viaAPILoader());
  }

  public static wrap<T, D extends IValueTypeDesc>(desc: IVectorDataDescription<D>, rows: string[], rowIds: number[], data: T[]) {
    return new Vector(desc, VectorLoaderUtils.viaDataLoader(rows, rowIds, data));
  }

  public static asVector<T>(rows: string[], data: T[], options: IAsVectorOptions = {}) {
    const desc = BaseUtils.mixin(VectorUtils.createDefaultVectorDesc(), {
      size: data.length,
      value: ValueTypeUtils.guessValueTypeDesc(data)
    }, options);

    const rowAssigner = options.rowassigner || LocalIDAssigner.create();
    return new Vector(desc, VectorLoaderUtils.viaDataLoader(rows, rowAssigner(rows), data));
  }
}
