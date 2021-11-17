import {Range, RangeLike, ParseRangeUtils} from '../range';
import {ASelectAble, IDTypeManager} from '../idtype';
import {IValueTypeDesc} from '../data/valuetype';
import {IAtom, IAtomDataDescription} from './IAtom';

/**
 * base class for different Atom implementations
 * @internal
 */
export abstract class AAtom<T,D extends IValueTypeDesc> extends ASelectAble {

  constructor(public readonly desc: IAtomDataDescription<D>) {
    super();
  }

  get dim() {
    return [1];
  }

  get valuetype() {
    return this.desc.value;
  }

  get idtype() {
    return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
  }

  get idtypes() {
    return [this.idtype];
  }

  ids(range = Range.all()): Promise<Range> {
    range = ParseRangeUtils.parseRangeLike(range);
    if (range.isNone) {
      return Promise.resolve(Range.none());
    }
    return this.id();
  }

  idView(idRange?: RangeLike): Promise<IAtom<T,D>> {
    return Promise.resolve(<IAtom<T,D>><any>this);
  }

  abstract id(): Promise<Range>;

  persist() {
    return this.desc.id;
  }

  restore(persisted: any) {
    return this;
  }
}
