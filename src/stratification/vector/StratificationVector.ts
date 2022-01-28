import { Range, RangeLike } from '../../range';
import { CompositeRange1D } from '../../range/CompositeRange1D';
import { IDataType, ADataType, IValueTypeDesc } from '../../data';
import { IHistogram, RangeHistogram } from '../../data/histogram';
import { ICategoricalVector, IVector } from '../../vector/IVector';
import { IStratification, IStratificationDataDescription } from '../IStratification';
import { StratificationGroup } from '../StratificationGroup';

/**
 * root matrix implementation holding the data
 * @internal
 */
export class StratificationVector extends ADataType<IStratificationDataDescription> implements IStratification {
  constructor(private v: IVector<any, IValueTypeDesc>, private r: CompositeRange1D) {
    super({
      id: `${v.desc.id}-s`,
      name: v.desc.name,
      description: v.desc.description,
      creator: v.desc.creator,
      ts: v.desc.ts,
      fqname: v.desc.fqname,
      type: 'stratification',
      idtype: v.idtype.id,
      size: v.length,
      ngroups: r.groups.length,
      groups: r.groups.map((ri) => ({ name: ri.name, color: ri.color, size: ri.length })),
    });
  }

  get idtype() {
    return this.v.idtype;
  }

  get groups() {
    return this.desc.groups;
  }

  group(group: number): IStratification {
    return new StratificationGroup(this, group, this.groups[group]);
  }

  async hist(bins?: number, range: RangeLike = Range.all()): Promise<IHistogram> {
    // FIXME unused parameter
    return RangeHistogram.rangeHist(await this.range());
  }

  vector(): Promise<ICategoricalVector> {
    return this.asVector();
  }

  asVector(): Promise<ICategoricalVector> {
    return Promise.resolve(<ICategoricalVector>this.v);
  }

  origin(): Promise<IDataType> {
    return this.asVector();
  }

  range(): Promise<CompositeRange1D> {
    return Promise.resolve(this.r);
  }

  async idRange(): Promise<CompositeRange1D> {
    const ids = await this.ids();
    return <CompositeRange1D>ids.dim(0).preMultiply(this.r, this.dim[0]);
  }

  names(range: RangeLike = Range.all()) {
    return this.v.names(range);
  }

  ids(range: RangeLike = Range.all()): Promise<Range> {
    return this.v.ids(range);
  }

  get idtypes() {
    return [this.idtype];
  }

  size() {
    return this.desc.size;
  }

  get length() {
    return this.size();
  }

  get ngroups() {
    return this.groups.length;
  }

  get dim() {
    return [this.size()];
  }

  persist() {
    return {
      root: this.v.persist(),
      asstrat: true,
    };
  }
}
