import {AVector} from '../../vector/AVector';
import {IStringValueTypeDesc, IDataType} from '../../data';
import {IVector, IVectorDataDescription} from '../../vector';
import {RangeLike, ParseRangeUtils, Range} from '../../range';
import {ArrayUtils} from '../../base/ArrayUtils';
import {IDType} from '../../idtype/IDType';

export declare type IStringVector = IVector<string, IStringValueTypeDesc>;

export abstract class ANameVector<T extends IDataType> extends AVector<string, IStringValueTypeDesc> {
  readonly desc: IVectorDataDescription<IStringValueTypeDesc>;

  constructor(protected base: T) {
    super(null);
    this.desc = {
      type: 'vector',
      name: base.desc.name,
      fqname: base.desc.fqname,
      description: base.desc.description,
      id: base.desc.id + '_names',
      value: {
        type: 'string'
      },
      idtype: this.idtype.id,
      size: this.length,
      ts: base.desc.ts,
      creator: base.desc.creator,
      group: base.desc.group,
      permissions: base.desc.permissions
    };
  }

  get valuetype() {
    return this.desc.value;
  }

  // TODO This method should be abstract. However, it results in a compile error with Typescript v2.7.2:
  // `TS2715: Abstract property 'idtype' in class 'ANameVector' cannot be accessed in the constructor.`
  /*abstract*/ get idtype(): IDType {
    return null;
  }

  get idtypes() {
    return [this.idtype];
  }

  persist(): any {
    return {
      root: this.base.persist(),
      names: true
    };
  }

  restore(persisted: any) {
    let r: IVector<string, IStringValueTypeDesc> = this;
    if (persisted && persisted.range) { //some view onto it
      r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
    }
    return r;
  }

  at(i: number) {
    return this.data(Range.list(i)).then((names) => names[0]);
  }

  abstract names(range?: RangeLike): Promise<string[]>;

  data(range: RangeLike = Range.all()) {
    return this.names(range);
  }

  async sort(compareFn?: (a: string, b: string) => number, thisArg?: any): Promise<IStringVector> {
    const d = await this.data();
    const indices = ArrayUtils.argSort(d, compareFn, thisArg);
    return this.view(Range.list(indices));
  }

  async filter(callbackfn: (value: string, index: number) => boolean, thisArg?: any): Promise<IStringVector> {
    const d = await this.data();
    const indices = ArrayUtils.argFilter(d, callbackfn, thisArg);
    return this.view(Range.list(indices));
  }
}
