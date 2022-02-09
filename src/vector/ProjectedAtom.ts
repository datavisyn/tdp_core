import { IValueTypeDesc } from '../data/valuetype';
import { IAtom, IAtomDataDescription, IAtomValue } from '../atom/IAtom';
import { RangeLike, Range, ParseRangeUtils } from '../range';
import { ASelectAble } from '../idtype';
import { IVector } from './IVector';

export class ProjectedAtom<T, D extends IValueTypeDesc, M, MD extends IValueTypeDesc> extends ASelectAble implements IAtom<T, D> {
  readonly desc: IAtomDataDescription<D>;

  private cache: Promise<IAtomValue<T>> = null;

  constructor(
    private v: IVector<M, MD>,
    private f: (data: M[], ids: Range, names: string[]) => IAtomValue<T>,
    private thisArgument = v,
    public readonly valuetype: D = <any>v.valuetype,
    private _idtype = v.idtype,
  ) {
    super();

    this.desc = {
      name: `${v.desc.name}-p`,
      fqname: `${v.desc.fqname}-p`,
      type: 'atom',
      id: `${v.desc.id}-p`,
      idtype: v.idtype,
      value: this.valuetype,
      description: v.desc.description,
      creator: v.desc.creator,
      ts: v.desc.ts,
    };
  }

  private load() {
    if (this.cache === null) {
      this.cache = Promise.all<any>([this.v.data(), this.v.ids(), this.v.names()]).then((arr: any[]) => {
        return this.f.apply(this.thisArgument, arr);
      });
    }
    return this.cache;
  }

  async id() {
    const d = await this.load();
    return Range.list(d.id);
  }

  async name() {
    const d = await this.load();
    return d.name;
  }

  async data() {
    const d = await this.load();
    return d.value;
  }

  get dim() {
    return [1];
  }

  get idtype() {
    return this._idtype;
  }

  get idtypes() {
    return [this._idtype];
  }

  ids(range = Range.all()): Promise<Range> {
    range = ParseRangeUtils.parseRangeLike(range);
    if (range.isNone) {
      return Promise.resolve(Range.none());
    }
    return this.id();
  }

  idView(idRange?: RangeLike): Promise<IAtom<T, D>> {
    return Promise.resolve(<IAtom<T, D>>(<any>this));
  }

  persist() {
    return {
      root: this.v.persist(),
      f: this.f.toString(),
      valuetype: this.valuetype === <any>this.v.valuetype ? undefined : this.valuetype,
      idtype: this.idtype === this.v.idtype ? undefined : this.idtype.name,
    };
  }

  restore(persisted: any) {
    return this;
  }
}
