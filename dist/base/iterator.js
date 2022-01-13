export class AIterator {
    hasNext() {
        return false;
    }
    next() {
        return null;
    }
    forEach(callbackfn, thisArg) {
        let i = 0;
        while (this.hasNext()) {
            callbackfn.call(thisArg, this.next(), i++);
        }
    }
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map(callbackfn, thisArg) {
        // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new TransformIterator(this, callbackfn, thisArg);
    }
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList() {
        const r = [];
        while (this.hasNext()) {
            r.push(this.next());
        }
        return r;
    }
    get isIncreasing() {
        return false;
    }
    get isDecreasing() {
        return false;
    }
    get byOne() {
        return false;
    }
    get byMinusOne() {
        return false;
    }
}
/**
 * iterator for a given range
 */
export class Iterator extends AIterator {
    constructor(from, to, step) {
        super();
        this.from = from;
        this.to = to;
        this.step = step;
        this.act = this.from;
    }
    /**
     * whether more items are available
     */
    hasNext() {
        return this.act !== this.to && ((this.step > 0 && this.act < this.to) || (this.step < 0 && this.act > this.to));
    }
    /**
     * returns the next item
     */
    next() {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        const r = this.act;
        this.act += this.step;
        if (this.step < 0 && this.act < this.to) {
            this.act = this.to;
        }
        else if (this.step > 0 && this.act > this.to) {
            this.act = this.to;
        }
        return r;
    }
    get isIncreasing() {
        return this.step > 0;
    }
    get isDecreasing() {
        return this.step < 0;
    }
    get byOne() {
        return this.step === 1;
    }
    get byMinusOne() {
        return this.step === -1;
    }
    get size() {
        if (this.byOne) {
            return Math.max(this.to - this.from, 0);
        }
        if (this.byMinusOne) {
            return Math.max(this.from - this.to, 0);
        }
        const d = this.isIncreasing ? this.to - this.from + 1 : this.from - this.to + 1;
        const s = Math.abs(this.step);
        if (d <= 0) {
            // no range
            return 0;
        }
        return Math.floor(d / s);
    }
    /**
     * creates a new iterator for the given range
     * @param from
     * @param to
     * @param step
     * @returns {Iterator}
     */
    static create(from, to, step) {
        return new Iterator(from, to, step);
    }
}
export class ListIterator extends AIterator {
    constructor(arr) {
        super();
        this.arr = arr;
        this.it = new Iterator(0, arr.length, 1);
    }
    /**
     * whether more items are available
     */
    hasNext() {
        return this.it.hasNext();
    }
    /**
     * returns the next item
     */
    next() {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.arr[this.it.next()];
    }
    asList() {
        return this.arr.slice();
    }
    /**
     * creates a new iterator for the given list
     * @param arr
     * @returns {ListIterator}
     */
    static create(arr) {
        return new ListIterator(arr);
    }
}
export class SingleIterator extends AIterator {
    constructor(value) {
        super();
        this.value = value;
        this.delivered = false;
    }
    hasNext() {
        return !this.delivered;
    }
    next() {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        this.delivered = true;
        return this.value;
    }
    asList() {
        return [this.value];
    }
    get isIncreasing() {
        return true;
    }
    get isDecreasing() {
        return true;
    }
    get byOne() {
        return true;
    }
    get byMinusOne() {
        return true;
    }
    static create(value) {
        return new SingleIterator(value);
    }
}
export class EmptyIterator extends AIterator {
    constructor() {
        super(...arguments);
        this.isIncreasing = false;
        this.isDecreasing = false;
        this.byOne = false;
        this.byMinusOne = false;
    }
    /**
     * whether more items are available
     */
    hasNext() {
        return false;
    }
    /**
     * returns the next item
     */
    next() {
        throw new RangeError('end of iterator');
    }
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList() {
        return [];
    }
    static create() {
        return new EmptyIterator();
    }
}
export class ConcatIterator extends AIterator {
    constructor(its) {
        super();
        this.its = its;
        this.act = its.shift();
    }
    /**
     * whether more items are available
     */
    hasNext() {
        // based on http://grepcode.com/file/repo1.maven.org/maven2/com.google.guava/guava/r08/com/google/common/collect/Iterators.java#Iterators.concat%28java.util.Iterator%29
        let currentHasNext = false;
        // eslint-disable-next-line no-cond-assign
        while (!(currentHasNext = this.act.hasNext()) && this.its.length > 0) {
            this.act = this.its.shift();
        }
        return currentHasNext;
    }
    /**
     * returns the next item
     */
    next() {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.act.next();
    }
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList() {
        const r = [];
        while (this.hasNext()) {
            r.push(this.next());
        }
        return r;
    }
    get isIncreasing() {
        return this.its.every((it) => it.isIncreasing);
    }
    get isDecreasing() {
        return this.its.every((it) => it.isDecreasing);
    }
    get byOne() {
        return this.its.every((it) => it.byOne);
    }
    get byMinusOne() {
        return this.its.every((it) => it.byMinusOne);
    }
    static concatIterators(...its) {
        if (its.length === 0) {
            return EmptyIterator.create();
        }
        if (its.length === 1) {
            return its[0];
        }
        return new ConcatIterator(its);
    }
}
class TransformIterator extends AIterator {
    constructor(it, f, thisArg) {
        super();
        this.it = it;
        this.f = f;
        this.thisArg = thisArg;
    }
    /**
     * whether more items are available
     */
    hasNext() {
        return this.it.hasNext();
    }
    /**
     * returns the next item
     */
    next() {
        if (!this.hasNext()) {
            throw new RangeError('end of iterator');
        }
        return this.f.call(this.thisArg, this.it.next());
    }
    get isIncreasing() {
        return this.it.isIncreasing;
    }
    get isDecreasing() {
        return this.it.isDecreasing;
    }
    get byOne() {
        return this.it.byOne;
    }
    get byMinusOne() {
        return this.it.byMinusOne;
    }
}
//# sourceMappingURL=iterator.js.map