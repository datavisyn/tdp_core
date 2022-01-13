import { BaseUtils } from '../base/BaseUtils';
import { RangeLike, Range, CompositeRange1D, ParseRangeUtils } from '../range';
import { IDTypeManager, LocalIDAssigner } from '../idtype';
import { ADataType, IDataType, ValueTypeUtils, ICategory } from '../data';
import { DataCache } from '../data/DataCache';
import { ICategoricalVector } from '../vector';
import { RangeHistogram, IHistogram } from '../data/histogram';
import { IStratification, IStratificationDataDescription } from './IStratification';
import { StratificationGroup } from './StratificationGroup';
import { StratificationUtils } from './StratificationUtils';
import { IStratificationLoader, StratificationLoaderUtils } from './loader';
import { StratificationCategoricalVector } from './StratificationCategoricalVector';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class Stratification extends ADataType<IStratificationDataDescription> implements IStratification {
  private _v: Promise<ICategoricalVector>;

  constructor(desc: IStratificationDataDescription, private loader: IStratificationLoader) {
    super(desc);
  }

  get idtype() {
    return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
  }

  get groups() {
    return this.desc.groups;
  }

  group(group: number): IStratification {
    return new StratificationGroup(this, group, this.groups[group]);
  }

  async hist(bins?: number, range?: Range): Promise<IHistogram> {
    // TODO
    return RangeHistogram.rangeHist(await this.range());
  }

  vector() {
    return this.asVector();
  }

  asVector(): Promise<ICategoricalVector> {
    if (!this._v) {
      this._v = this.loader(this.desc).then((data) => new StratificationCategoricalVector(this, data.range));
    }
    return this._v;
  }

  origin(): Promise<IDataType> {
    if ('origin' in this.desc) {
      return DataCache.getInstance().getFirstByFQName(this.desc.origin);
    }
    return Promise.reject('no origin specified');
  }

  async range(): Promise<CompositeRange1D> {
    return (await this.loader(this.desc)).range;
  }

  async idRange(): Promise<CompositeRange1D> {
    const data = await this.loader(this.desc);
    const ids = data.rowIds.dim(0);
    const { range } = data;
    return <CompositeRange1D>ids.preMultiply(range, this.dim[0]);
  }

  async names(range: RangeLike = Range.all()) {
    return ParseRangeUtils.parseRangeLike(range).filter((await this.loader(this.desc)).rows, this.dim);
  }

  async ids(range: RangeLike = Range.all()): Promise<Range> {
    return (await this.loader(this.desc)).rowIds.preMultiply(ParseRangeUtils.parseRangeLike(range), this.dim);
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.desc.size;
  }

  get length() {
    return this.dim[0];
  }

  get ngroups() {
    return this.desc.ngroups;
  }

  get dim() {
    return [this.size()];
  }

  persist() {
    return this.desc.id;
  }

  static guessColor(stratification: string, group: string) {
    switch (group.toLowerCase()) {
      case 'male':
        return 'blue';
      case 'female':
        return 'red';
      case 'deceased':
        return '#e41a1b';
      case 'living':
        return '#377eb8';
    }
    return 'gray';
  }

  /**
   * module entry point for creating a datatype
   * @param desc
   * @returns {IVector}
   */
  static create(desc: IStratificationDataDescription): Stratification {
    return new Stratification(desc, StratificationLoaderUtils.viaAPILoader());
  }

  static wrap(desc: IStratificationDataDescription, rows: string[], rowIds: number[], range: CompositeRange1D) {
    return new Stratification(desc, StratificationLoaderUtils.viaDataLoader(rows, rowIds, range));
  }

  static asStratification(rows: string[], range: CompositeRange1D, options: IAsStratifcationOptions = {}) {
    const desc = BaseUtils.mixin(
      StratificationUtils.createDefaultStratificationDesc(),
      {
        size: 0,
        groups: range.groups.map((r) => ({ name: r.name, color: r.color, size: r.length })),
        ngroups: range.groups.length,
      },
      options,
    );

    const rowAssigner = options.rowassigner || LocalIDAssigner.create();
    return new Stratification(desc, StratificationLoaderUtils.viaDataLoader(rows, rowAssigner(rows), range));
  }

  static wrapCategoricalVector(v: ICategoricalVector) {
    if (v.valuetype.type !== ValueTypeUtils.VALUE_TYPE_CATEGORICAL) {
      throw new Error(`invalid vector value type: ${v.valuetype.type}`);
    }
    const toGroup = (g: string | ICategory) => {
      if (typeof g === 'string') {
        return { name: <string>g, color: 'gray', size: NaN };
      }
      const cat = <ICategory>g;
      return { name: cat.name, color: cat.color || 'gray', size: NaN };
    };
    const cats = v.desc.value.categories.map(toGroup);
    const desc: IStratificationDataDescription = {
      id: `${v.desc.id}-s`,
      type: 'stratification',
      name: `${v.desc.name}-s`,
      fqname: `${v.desc.fqname}-s`,
      description: v.desc.description,
      idtype: v.idtype.id,
      ngroups: cats.length,
      groups: cats,
      size: v.length,
      creator: v.desc.creator,
      ts: v.desc.ts,
    };

    function loader() {
      return Promise.all<any>([v.groups(), v.ids(), v.names()]).then((args) => {
        const range = <CompositeRange1D>args[0];
        range.groups.forEach((g, i) => (cats[i].size = g.length));
        return {
          range: args[0],
          rowIds: args[1],
          rows: args[2],
        };
      });
    }
    return new Stratification(desc, loader);
  }
}

export interface IAsStratifcationOptions {
  name?: string;
  idtype?: string;
  rowassigner?(ids: string[]): Range;
}
