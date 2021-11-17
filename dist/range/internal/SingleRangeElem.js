import { RangeUtils } from './RangeUtils';
import { SingleIterator } from '../../base/iterator';
export class SingleRangeElem {
    constructor(from) {
        this.from = from;
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
    size(size) {
        return 1;
    }
    clone() {
        return new SingleRangeElem(this.from);
    }
    contains(value, size) {
        return RangeUtils.fixRange(this.from, size) === value;
    }
    reverse() {
        return this.clone();
    }
    invert(index, size) {
        return RangeUtils.fixRange(this.from, size) + index;
    }
    iter(size) {
        return SingleIterator.create(RangeUtils.fixRange(this.from, size));
    }
    get __iterator__() {
        return this.iter();
    }
    toString() {
        return this.from.toString();
    }
}
//# sourceMappingURL=SingleRangeElem.js.map