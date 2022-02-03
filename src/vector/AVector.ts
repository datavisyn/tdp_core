import { Range, RangeLike, Range1DGroup, ParseRangeUtils } from '../range';
import { CompositeRange1D } from '../range/CompositeRange1D';
import { ArrayUtils } from '../base/ArrayUtils';
import { ASelectAble, IDTypeManager, IDType } from '../idtype';
import {
  Categorical2PartioningUtils,
  ICategorical2PartitioningOptions,
  ICategory,
  ICategoricalValueTypeDesc,
  INumberValueTypeDesc,
  ValueTypeUtils,
  IValueTypeDesc,
} from '../data';
import { IHistogram, Histogram, CatHistogram } from '../data/histogram';
import { IAdvancedStatistics, IStatistics, Statistics, AdvancedStatistics } from '../base/statistics';
import { IVector } from './IVector';
import { ProjectedAtom } from './ProjectedAtom';
import { IAtom, IAtomValue } from '../atom/IAtom';
/**
 * base class for different Vector implementations, views, transposed,...
 * @internal
 */
export abstract class AVector<T, D extends IValueTypeDesc> extends ASelectAble {
  constructor(protected root: IVector<T, D>) {
    super();
  }

  get dim() {
    return [this.length];
  }

  abstract data(range?: RangeLike): Promise<any[]>;

  abstract size(): number;

  get length() {
    return this.size();
  }

  view(range: RangeLike = Range.all()): IVector<T, D> {
    // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new VectorView(this.root, ParseRangeUtils.parseRangeLike(range));
  }

  async idView(idRange: RangeLike = Range.all()): Promise<IVector<T, D>> {
    const ids = await this.ids();
    return this.view(ids.indexOf(ParseRangeUtils.parseRangeLike(idRange)));
  }

  async stats(range: RangeLike = Range.all()): Promise<IStatistics> {
    if (this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_INT && this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_REAL) {
      return Promise.reject(`invalid value type: ${this.root.valuetype.type}`);
    }
    return Statistics.computeStats(await this.data(range));
  }

  async statsAdvanced(range: RangeLike = Range.all()): Promise<IAdvancedStatistics> {
    if (this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_INT && this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_REAL) {
      return Promise.reject(`invalid value type: ${this.root.valuetype.type}`);
    }
    return AdvancedStatistics.computeAdvancedStats(await this.data(range));
  }

  get indices(): Range {
    return Range.range(0, this.length);
  }

  /**
   * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
   */
  async groups(): Promise<CompositeRange1D> {
    const v = this.root.valuetype;
    if (v.type === ValueTypeUtils.VALUE_TYPE_CATEGORICAL) {
      const vc = <ICategoricalValueTypeDesc>(<any>v);
      const d = await this.data();
      const options: ICategorical2PartitioningOptions = {
        name: this.root.desc.id,
      };
      if (typeof vc.categories[0] !== 'string') {
        const vcc = <ICategory[]>vc.categories;
        if (vcc[0].color) {
          options.colors = vcc.map((a) => a.color);
        }
        if (vcc[0].label) {
          options.labels = vcc.map((a) => a.label);
        }
      }
      return Categorical2PartioningUtils.categorical2partitioning(
        d,
        vc.categories.map((a) => (typeof a === 'string' ? a : a.name)),
        options,
      );
    }
    return Promise.resolve(CompositeRange1D.composite(this.root.desc.id, [Range1DGroup.asUngrouped(this.indices.dim(0))]));
  }

  async hist(bins?: number, range: RangeLike = Range.all()): Promise<IHistogram> {
    const v = this.root.valuetype;
    const d = await this.data(range);
    switch (v.type) {
      case ValueTypeUtils.VALUE_TYPE_CATEGORICAL:
        // eslint-disable-next-line no-case-declarations
        const vc = <ICategoricalValueTypeDesc>(<any>v);
        return CatHistogram.categoricalHist(
          d,
          this.indices.dim(0),
          d.length,
          vc.categories.map((a) => (typeof a === 'string' ? a : a.name)),
          vc.categories.map((a) => (typeof a === 'string' ? a : a.label || a.name)),
          vc.categories.map((a) => (typeof a === 'string' ? 'gray' : a.color || 'gray')),
        );
      case ValueTypeUtils.VALUE_TYPE_REAL:
      case ValueTypeUtils.VALUE_TYPE_INT:
        // eslint-disable-next-line no-case-declarations
        const vn = <INumberValueTypeDesc>(<any>v);
        return Histogram.hist(d, this.indices.dim(0), d.length, bins || Math.round(Math.sqrt(this.length)), vn.range);
      default:
        return null; // cant create hist for unique objects or other ones
    }
  }

  async every(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return (await this.data()).every(callbackfn, thisArg);
  }

  async some(callbackfn: (value: T, index: number) => boolean, thisArg?: any): Promise<boolean> {
    return (await this.data()).some(callbackfn, thisArg);
  }

  async forEach(callbackfn: (value: T, index: number) => void, thisArg?: any) {
    (await this.data()).forEach(callbackfn, thisArg);
  }

  async reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      // eslint-disable-next-line prefer-rest-params
      return callbackfn.apply(thisArg, Array.from(arguments));
    }

    return (await this.data()).reduce(helper, initialValue);
  }

  async reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U, thisArg?: any): Promise<U> {
    function helper() {
      // eslint-disable-next-line prefer-rest-params
      return callbackfn.apply(thisArg, Array.from(arguments));
    }

    return (await this.data()).reduceRight(helper, initialValue);
  }

  reduceAtom<U, UD extends IValueTypeDesc>(
    f: (data: T[], ids: Range, names: string[]) => IAtomValue<U>,
    thisArgument?: any,
    valuetype?: UD,
    idtype?: IDType,
  ): IAtom<U, UD> {
    const r: IVector<T, D> = <IVector<T, D>>(<any>this);
    return new ProjectedAtom(r, f, thisArgument, valuetype, idtype);
  }

  restore(persisted: any) {
    let r: IVector<T, D> = <IVector<T, D>>(<any>this);
    if (persisted && persisted.f) {
      return this.reduceAtom(
        // eslint-disable-next-line no-eval
        eval(persisted.f),
        this,
        persisted.valuetype,
        persisted.idtype ? IDTypeManager.getInstance().resolveIdType(persisted.idtype) : undefined,
      );
    }
    if (persisted && persisted.range) {
      // some view onto it
      r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
    }
    return r;
  }
}

/**
 * view on the vector restricted by a range
 * @internal
 */
export class VectorView<T, D extends IValueTypeDesc> extends AVector<T, D> {
  /**
   * @param root underlying matrix
   * @param range range selection
   */
  constructor(root: IVector<T, D>, private range: Range) {
    super(root);
  }

  get desc() {
    return this.root.desc;
  }

  persist() {
    return {
      root: this.root.persist(),
      range: this.range.toString(),
    };
  }

  size() {
    return this.range.size(this.root.dim)[0];
  }

  at(i: number) {
    const inverted = this.range.invert([i], this.root.dim);
    return this.root.at(inverted[0]);
  }

  data(range: RangeLike = Range.all()) {
    return this.root.data(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  names(range: RangeLike = Range.all()) {
    return this.root.names(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  ids(range: RangeLike = Range.all()) {
    return this.root.ids(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
  }

  view(range: RangeLike = Range.all()) {
    const r = ParseRangeUtils.parseRangeLike(range);
    if (r.isAll) {
      return this;
    }
    return new VectorView(this.root, this.range.preMultiply(r, this.dim));
  }

  get valuetype() {
    return this.root.valuetype;
  }

  get idtype() {
    return this.root.idtype;
  }

  get idtypes() {
    return [this.idtype];
  }

  /* get indices() {
   return this.range;
   } */

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
