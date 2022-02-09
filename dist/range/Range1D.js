import { RangeElem } from './internal/RangeElem';
import { Iterator, ListIterator, ConcatIterator } from '../base/iterator';
function sortNumeric(a, b) {
    return a - b;
}
export class Range1D {
    constructor(arg) {
        if (arg instanceof Range1D) {
            this.arr = arg.arr;
        }
        else if (Array.isArray(arg)) {
            this.arr = arg;
        }
        else {
            this.arr = [];
        }
    }
    get length() {
        return this.size();
    }
    static all() {
        return new Range1D([RangeElem.all()]);
    }
    static single(item) {
        return new Range1D([RangeElem.single(item)]);
    }
    static none() {
        return new Range1D();
    }
    static from(indices) {
        return new Range1D(Range1D.compress(indices));
    }
    static compress(indices) {
        if (indices.length === 0) {
            return [];
        }
        if (indices.length === 1) {
            return [RangeElem.single(indices[0])];
        }
        // return indices.map(RangeElem.single);
        const r = [];
        const deltas = indices.slice(1).map((e, i) => e - indices[i]);
        let start = 0;
        let act = 1;
        let i = 0;
        while (act < indices.length) {
            while (deltas[start] === deltas[act - 1] && act < indices.length) {
                // while the same delta
                act++;
            }
            if (act === start + 1) {
                // just a single item used
                r.push(RangeElem.single(indices[start]));
            }
            else if (deltas[start] === 1) {
                // +1 since end is excluded
                // fix while just +1 is allowed and -1 is not allowed
                r.push(RangeElem.range(indices[start], indices[act - 1] + deltas[start], deltas[start]));
            }
            else {
                for (i = start; i < act; i++) {
                    r.push(RangeElem.single(indices[i]));
                }
            }
            start = act;
            act += 1;
        }
        while (start < indices.length) {
            // corner case by adding act+1, it might happen that the last one isnt considered
            r.push(RangeElem.single(indices[start++]));
        }
        return r;
    }
    get isAll() {
        return this.arr.length === 1 && this.at(0).isAll;
    }
    get isNone() {
        return this.arr.length === 0;
    }
    get isUnbound() {
        return this.arr.some((d) => d.isUnbound);
    }
    get isList() {
        return this.arr.every((d) => d.isSingle);
    }
    push(...items) {
        function p(item) {
            if (typeof item === 'string') {
                return RangeElem.parse(item.toString());
            }
            if (typeof item === 'number') {
                return RangeElem.single(item);
            }
            if (Array.isArray(item)) {
                return new RangeElem(item[0], item[1], item[2]);
            }
            return item;
        }
        return this.arr.push(...items.map(p));
    }
    pushSlice(from, to = -1, step = 1) {
        this.arr.push(new RangeElem(from, to, step));
    }
    pushList(indices) {
        this.arr.push(...Range1D.compress(indices));
    }
    setSlice(from, to = -1, step = 1) {
        this.arr.length = 0;
        this.pushSlice(from, to, step);
    }
    setList(indices) {
        this.arr.length = 0;
        this.pushList(indices);
    }
    at(index) {
        if (index < 0) {
            index += this.length;
        }
        if (index < 0 || index >= this.arr.length) {
            return RangeElem.none();
        }
        return this.arr[index];
    }
    size(size) {
        const t = this.arr.map((d) => d.size(size));
        return t.reduce((a, b) => a + b, 0);
    }
    /**
     * whether this range is the identity, i.e. the first natural numbers starting with 0
     * @return {boolean}
     */
    get isIdentityRange() {
        return this.arr.length === 1 && this.arr[0].from === 0 && this.arr[0].step === 1;
    }
    repeat(ntimes = 1) {
        if (ntimes === 1) {
            return this;
        }
        const r = this.arr.slice();
        // push n times
        for (let i = 1; i < ntimes; ++i) {
            r.push.apply(r, this.arr);
        }
        return new Range1D(r);
    }
    /**
     * combines this range with another and returns a new one
     * this = (1,3,5,7), sub = (1,2) -> (1,2)(1,3,5,7) = (3,5)
     * @returns {Range1D}
     */
    preMultiply(sub, size) {
        if (this.isAll) {
            return sub.clone();
        }
        if (sub.isAll) {
            return this.clone();
        }
        if (sub.isNone || this.isNone) {
            return Range1D.none();
        }
        if (this.isIdentityRange) {
            // identity lookup
            return sub.clone();
        }
        // TODO optimize
        const l = this.iter(size).asList();
        const mapImpl = (sup) => {
            const s = sup.iter(l.length);
            const r = [];
            s.forEach((i) => {
                if (i >= 0 && i < l.length) {
                    // check for out of range
                    r.push(l[i]);
                }
            });
            return sup.fromLike(r);
        };
        if (typeof sub.fromLikeComposite === 'function') {
            const csub = sub;
            return csub.fromLikeComposite(csub.groups.map(mapImpl));
        }
        return mapImpl(sub);
    }
    /**
     * logical union between two ranges
     * @param other
     * @returns {Range1D}
     */
    union(other, size) {
        if (this.isAll || other.isNone) {
            return this.clone();
        }
        if (other.isAll || this.isNone) {
            return other.clone();
        }
        const r = this.iter(size).asList();
        const it2 = other.iter(size);
        it2.forEach((i) => {
            if (r.indexOf(i) < 0) {
                r.push(i);
            }
        });
        return other.fromLike(r.sort(sortNumeric));
    }
    /**
     * logical intersection between two ranges
     * @param other
     * @param size
     * @returns {Range1D}
     */
    intersect(other, size) {
        if (this.isNone || other.isNone) {
            return Range1D.none();
        }
        if (this.isAll) {
            return other.clone();
        }
        if (other.isAll) {
            return this.clone();
        }
        const it1 = this.iter(size).asList();
        const it2 = other.iter(size);
        const r = [];
        it2.forEach((i) => {
            if (it1.indexOf(i) >= 0) {
                r.push(i);
            }
        });
        return other.fromLike(r.sort(sortNumeric));
    }
    toSet(size) {
        return this.removeDuplicates(size);
    }
    /**
     * logical difference between two ranges
     * @param without
     * @param size
     * @returns {Range1D}
     */
    without(without, size) {
        if (this.isNone || without.isNone) {
            return this.clone();
        }
        if (without.isAll) {
            return Range1D.none();
        }
        const it1 = this.iter(size);
        const it2 = without.iter(size).asList();
        const r = [];
        it1.forEach((i) => {
            if (it2.indexOf(i) < 0) {
                r.push(i);
            }
        });
        return Range1D.from(r.sort(sortNumeric));
    }
    /**
     * clones this range
     * @returns {Range1D}
     */
    clone() {
        return new Range1D(this.arr.map((d) => d.clone()));
    }
    /**
     * inverts the given index to the original range
     * @param index
     * @param size the underlying size for negative indices
     * @returns {number}
     */
    invert(index, size) {
        if (this.isAll) {
            return index;
        }
        if (this.isNone) {
            return -1; // not mapped
        }
        // find the range element that contain the index-th element
        let s = this.arr[0].size(size);
        let act = 0;
        let total = s;
        const nElems = this.arr.length - 1;
        while (total < index && act < nElems) {
            act++;
            s = this.arr[act].size(size);
            total += s;
        }
        if (act >= this.arr.length) {
            return -1; // not mapped
        }
        return this.arr[act].invert(index - total + s, size);
    }
    /**
     * returns the index(ices) of the given elements
     * @return {*}
     */
    indexOf() {
        // eslint-disable-next-line prefer-rest-params
        if (arguments[0] instanceof Range1D) {
            // eslint-disable-next-line prefer-rest-params
            return this.indexRangeOf(arguments[0], arguments[1]);
        }
        let arr;
        const base = this.iter().asList();
        if (arguments.length === 1) {
            // eslint-disable-next-line prefer-rest-params
            if (typeof arguments[0] === 'number') {
                // eslint-disable-next-line prefer-rest-params
                return base.indexOf(arguments[0]);
            }
            // eslint-disable-next-line prefer-rest-params
            arr = arguments[0];
        }
        else {
            // eslint-disable-next-line prefer-rest-params
            arr = Array.from(arguments);
        }
        if (arr.length === 0) {
            return [];
        }
        return arr.map((index, i) => base.indexOf(index));
    }
    /**
     * returns the range representing the indices of the given range within the current data
     * @param r
     * @param size
     * @return {Range1D}
     */
    indexRangeOf(r, size) {
        if (r.isNone || this.isNone) {
            return r.fromLike([]);
        }
        if (r.isAll) {
            // index of all is still all
            return Range1D.all();
        }
        //
        let mapImpl;
        if (this.isIdentityRange) {
            const end = this.arr[0].to;
            mapImpl = (d, result) => {
                if (d >= 0 && d < end) {
                    result.push(d);
                }
            };
        }
        else {
            const arr = this.iter().asList();
            mapImpl = (d, result) => {
                const i = arr.indexOf(d);
                if (i >= 0) {
                    result.push(i);
                }
            };
        }
        if (typeof r.fromLikeComposite === 'function') {
            const csub = r;
            return csub.fromLikeComposite(csub.groups.map((g) => {
                const result = [];
                g.forEach((d) => mapImpl(d, result));
                return g.fromLike(result);
            }));
        }
        const result = [];
        r.forEach((d) => mapImpl(d, result));
        return r.fromLike(result);
    }
    /**
     * filters the given data according to this range
     * @param data
     * @param size the total size for resolving negative indices
     * @returns {*}
     */
    filter(data, size, transform = (d) => d) {
        if (this.isAll) {
            return data.map(transform);
        }
        const it = this.iter(size);
        // optimization
        if (it.byOne && it instanceof Iterator) {
            return data.slice(it.from, it.to).map(transform);
            // } else if (it.byMinusOne) {
            //  var d = data.slice();
            //  d.reverse();
            //  return d;
        }
        const r = [];
        while (it.hasNext()) {
            r.push(transform(data[it.next()]));
        }
        return r;
    }
    /**
     * creates an iterator of this range
     * @param size the underlying size for negative indices
     */
    iter(size) {
        if (this.isList) {
            return ListIterator.create(this.arr.map((d) => d.from));
        }
        const its = this.arr.map((d) => d.iter(size));
        return ConcatIterator.concatIterators.apply(null, its);
    }
    get __iterator__() {
        return this.iter();
    }
    asList(size) {
        return this.iter(size).asList();
    }
    get first() {
        if (this.isNone) {
            return null;
        }
        return this.arr[0].from;
    }
    get last() {
        if (this.isNone) {
            return null;
        }
        return this.arr[this.arr.length - 1].from;
    }
    /**
     * for each element
     * @param callbackfn
     * @param thisArg
     */
    forEach(callbackfn, thisArg) {
        return this.iter().forEach(callbackfn, thisArg);
    }
    contains(value, size) {
        return this.arr.some((elem) => elem.contains(value, size));
    }
    /**
     * sort
     * @param cmp
     * @return {Range1D}
     */
    sort(cmp = sortNumeric) {
        const arr = this.iter().asList();
        const r = arr.sort(cmp);
        return this.fromLike(r);
    }
    removeDuplicates(size) {
        let arr = this.iter().asList();
        arr = arr.sort(sortNumeric);
        arr = arr.filter((di, i) => di !== arr[i - 1]); // same value as before, remove
        return Range1D.from(arr);
    }
    /**
     * reverts the order of this range
     */
    reverse() {
        const a = this.arr.map((r) => r.reverse());
        a.reverse();
        return new Range1D(a);
    }
    toString() {
        if (this.isAll) {
            return '';
        }
        if (this.length === 1) {
            return this.arr[0].toString();
        }
        return `(${this.arr.join(',')})`;
    }
    eq(other) {
        if (this === other || (this.isAll && other.isAll) || (this.isNone && other.isNone)) {
            return true;
        }
        // TODO more performant comparison
        return this.toString() === other.toString();
    }
    fromLike(indices) {
        return Range1D.from(indices);
    }
}
//# sourceMappingURL=Range1D.js.map