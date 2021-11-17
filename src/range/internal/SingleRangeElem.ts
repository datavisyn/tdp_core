import {IRangeElem} from './IRangeElem';
import {RangeUtils} from './RangeUtils';
import {SingleIterator, IIterator} from '../../base/iterator';

export class SingleRangeElem implements IRangeElem {
  constructor(public readonly from: number) {
  }

  get step() {
    return 1;
  }

  get to() {
    return this.from + 1;
  }

  get isAll() {
    return false;
  }

  get isSingle() {
    return true;
  }

  get isUnbound() {
    return false;
  }

  size(size?: number): number {
    return 1;
  }

  clone() {
    return new SingleRangeElem(this.from);
  }

  contains(value: number, size?: number) {
    return RangeUtils.fixRange(this.from, size) === value;
  }

  reverse() {
    return this.clone();
  }

  invert(index: number, size?: number) {
    return RangeUtils.fixRange(this.from, size) + index;
  }

  iter(size?: number): IIterator<number> {
    return SingleIterator.create(RangeUtils.fixRange(this.from, size));
  }

  get __iterator__() {
    return this.iter();
  }

  toString() {
    return this.from.toString();
  }
}
