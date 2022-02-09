import { BaseUtils } from '../base/BaseUtils';
import { IValueTypeDesc, ValueTypeUtils } from '../data/valuetype';
import { IAtom, IAtomDataDescription, IAtomValue, IInlinedAtomDataDescription, AtomUtils } from './IAtom';
import { LocalIDAssigner } from '../idtype';
import { AAtom } from './AAtom';
import { Range } from '../range';

const noValue: IAtomValue<any> = {
  id: -1,
  name: '',
  value: null,
};

export class Atom<T, D extends IValueTypeDesc> extends AAtom<T, D> implements IAtom<T, D> {
  constructor(desc: IAtomDataDescription<D>, private readonly loaded: IAtomValue<T>) {
    super(desc);
  }

  id() {
    return Promise.resolve(Range.list(this.loaded.id));
  }

  name() {
    return Promise.resolve(this.loaded.name);
  }

  data() {
    return Promise.resolve(this.loaded.value);
  }

  static create<T, D extends IValueTypeDesc>(desc: IAtomDataDescription<D> | IInlinedAtomDataDescription<T, D>): IAtom<T, D> {
    if (typeof (<any>desc).data !== undefined) {
      return new Atom(desc, <IAtomValue<T>>(<any>desc).data);
    }
    return new Atom(desc, noValue);
  }

  static asAtom<T>(name: string, value: T, options: IAsAtomOptions = {}) {
    const desc = BaseUtils.mixin(
      AtomUtils.createDefaultAtomDesc(),
      {
        value: ValueTypeUtils.guessValueTypeDesc([value]),
      },
      options,
    );

    const rowAssigner = options.rowassigner || LocalIDAssigner.create();
    const atom = {
      name,
      value,
      id: rowAssigner([name]).first,
    };
    return new Atom(desc, atom);
  }
}

export interface IAsAtomOptions {
  name?: string;
  idtype?: string;
  rowassigner?(ids: string[]): Range;
}
