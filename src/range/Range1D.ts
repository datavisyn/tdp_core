import { IRangeElem } from './internal/internal';
import { RangeElem } from './internal/RangeElem';
import { IIterator, Iterator, ListIterator, ConcatIterator } from '../base/iterator';

function sortNumeric(a: number, b: number) {
  return a - b;
}

export class Range1D {
  private readonly arr: IRangeElem[];

  constructor(arg?: Range1D | IRangeElem[]) {
    if (arg instanceof Range1D) {
      this.arr = (<Range1D>arg).arr;
    } else if (Array.isArray(arg)) {
      this.arr = <IRangeElem[]>arg;
    } else {
      this.arr = [];
    }
  }

  get length(): number {
    return this.size();
  }

  static all(): Range1D {
    return new Range1D([RangeElem.all()]);
  }

  static single(item: number): Range1D {
    return new Range1D([RangeElem.single(item)]);
  }

  static none(): Range1D {
    return new Range1D();
  }

  static from(indices: number[]): Range1D {
    return new Range1D(Range1D.compress(indices));
  }

  private static compress(indices: number[]): IRangeElem[] {
    if (indices.length === 0) {
      return [];
    }
    if (indices.length === 1) {
      return [RangeElem.single(indices[0])];
    }
    // return indices.map(RangeElem.single);
    const r = <IRangeElem[]>[];
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
      } else if (deltas[start] === 1) {
        // +1 since end is excluded
        // fix while just +1 is allowed and -1 is not allowed
        r.push(RangeElem.range(indices[start], indices[act - 1] + deltas[start], deltas[start]));
      } else {
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

  get isAll(): boolean {
    return this.arr.length === 1 && this.at(0).isAll;
  }

  get isNone(): boolean {
    return this.arr.length === 0;
  }

  get isUnbound(): boolean {
    return this.arr.some((d) => d.isUnbound);
  }

  private get isList() {
    return this.arr.every((d) => d.isSingle);
  }

  push(...items: (IRangeElem | string | number | [number, number, number])[]): number {
    function p(item: any) {
      if (typeof item === 'string') {
        return RangeElem.parse(item.toString());
      }
      if (typeof item === 'number') {
        return RangeElem.single(<number>item);
      }
      if (Array.isArray(item)) {
        return new RangeElem(item[0], item[1], item[2]);
      }
      return <RangeElem>item;
    }

    return this.arr.push(...items.map(p));
  }

  pushSlice(from: number, to = -1, step = 1): void {
    this.arr.push(new RangeElem(from, to, step));
  }

  pushList(indices: number[]): void {
    this.arr.push(...Range1D.compress(indices));
  }

  setSlice(from: number, to = -1, step = 1): void {
    this.arr.length = 0;
    this.pushSlice(from, to, step);
  }

  setList(indices: number[]): void {
    this.arr.length = 0;
    this.pushList(indices);
  }

  at(index: number): IRangeElem {
    if (index < 0) {
      index += this.length;
    }
    if (index < 0 || index >= this.arr.length) {
      return RangeElem.none();
    }
    return this.arr[index];
  }

  size(size?: number): number {
    const t = this.arr.map((d) => d.size(size));
    return t.reduce((a, b) => a + b, 0);
  }

  /**
   * whether this range is the identity, i.e. the first natural numbers starting with 0
   * @return {boolean}
   */
  get isIdentityRange(): boolean {
    return this.arr.length === 1 && this.arr[0].from === 0 && this.arr[0].step === 1;
  }

  repeat(ntimes = 1): Range1D {
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
  preMultiply(sub: Range1D, size?: number): Range1D {
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
    const mapImpl = (sup: Range1D) => {
      const s = sup.iter(l.length);
      const r: number[] = [];
      s.forEach((i) => {
        if (i >= 0 && i < l.length) {
          // check for out of range
          r.push(l[i]);
        }
      });
      return sup.fromLike(r);
    };
    if (typeof (<ICompositeRange1D>sub).fromLikeComposite === 'function') {
      const csub = <ICompositeRange1D>sub;
      return csub.fromLikeComposite(<any>csub.groups.map(mapImpl));
    }
    return mapImpl(sub);
  }

  /**
   * logical union between two ranges
   * @param other
   * @returns {Range1D}
   */
  union(other: Range1D, size?: number): Range1D {
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
  intersect(other: Range1D, size?: number): Range1D {
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
    const r: number[] = [];
    it2.forEach((i) => {
      if (it1.indexOf(i) >= 0) {
        r.push(i);
      }
    });
    return other.fromLike(r.sort(sortNumeric));
  }

  toSet(size?: number) {
    return this.removeDuplicates(size);
  }

  /**
   * logical difference between two ranges
   * @param without
   * @param size
   * @returns {Range1D}
   */
  without(without: Range1D, size?: number): Range1D {
    if (this.isNone || without.isNone) {
      return this.clone();
    }
    if (without.isAll) {
      return Range1D.none();
    }
    const it1 = this.iter(size);
    const it2 = without.iter(size).asList();
    const r: number[] = [];
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
  clone(): Range1D {
    return new Range1D(this.arr.map((d) => d.clone()));
  }

  /**
   * inverts the given index to the original range
   * @param index
   * @param size the underlying size for negative indices
   * @returns {number}
   */
  invert(index: number, size?: number): number {
    if (this.isAll) {
      return index;
    }
    if (this.isNone) {
      return -1; // not mapped
    }
    // find the range element that contain the index-th element
    let s = this.arr[0].size(size);
    let act = 0;
    let total: number = s;
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

  indexOf(indices: number[]): number[];

  indexOf(index: number): number;

  indexOf(...index: number[]): number[];

  indexOf(r: Range1D, size?: number): Range1D;

  /**
   * returns the index(ices) of the given elements
   * @return {*}
   */
  indexOf(): any {
    // eslint-disable-next-line prefer-rest-params
    if (arguments[0] instanceof Range1D) {
      // eslint-disable-next-line prefer-rest-params
      return this.indexRangeOf(arguments[0], arguments[1]);
    }
    let arr: number[];
    const base = this.iter().asList();
    if (arguments.length === 1) {
      // eslint-disable-next-line prefer-rest-params
      if (typeof arguments[0] === 'number') {
        // eslint-disable-next-line prefer-rest-params
        return base.indexOf(<number>arguments[0]);
      }
      // eslint-disable-next-line prefer-rest-params
      arr = arguments[0];
    } else {
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
  indexRangeOf(r: Range1D, size?: number): Range1D {
    if (r.isNone || this.isNone) {
      return r.fromLike([]);
    }
    if (r.isAll) {
      // index of all is still all
      return Range1D.all();
    }
    //
    let mapImpl: (d: number, result: number[]) => void;
    if (this.isIdentityRange) {
      const end = this.arr[0].to;
      mapImpl = (d, result) => {
        if (d >= 0 && d < end) {
          result.push(d);
        }
      };
    } else {
      const arr = this.iter().asList();
      mapImpl = (d, result) => {
        const i = arr.indexOf(d);
        if (i >= 0) {
          result.push(i);
        }
      };
    }
    if (typeof (<ICompositeRange1D>r).fromLikeComposite === 'function') {
      const csub = <ICompositeRange1D>r;
      return csub.fromLikeComposite(
        csub.groups.map((g) => {
          const result: number[] = [];
          g.forEach((d) => mapImpl(d, result));
          return g.fromLike(result);
        }),
      );
    }
    const result: number[] = [];
    r.forEach((d) => mapImpl(d, result));
    return r.fromLike(result);
  }

  /**
   * filters the given data according to this range
   * @param data
   * @param size the total size for resolving negative indices
   * @returns {*}
   */
  filter(data: any[], size?: number, transform: (v: any) => any = (d) => d) {
    if (this.isAll) {
      return data.map(transform);
    }
    const it = this.iter(size);
    // optimization
    if (it.byOne && it instanceof Iterator) {
      return data.slice((<Iterator>(<any>it)).from, (<Iterator>(<any>it)).to).map(transform);
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
  iter(size?: number): IIterator<number> {
    if (this.isList) {
      return ListIterator.create(this.arr.map((d) => (<any>d).from));
    }
    const its: IIterator<number>[] = this.arr.map((d) => d.iter(size));
    return ConcatIterator.concatIterators.apply(null, its);
  }

  get __iterator__() {
    return this.iter();
  }

  asList(size?: number): number[] {
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
  forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void {
    return this.iter().forEach(callbackfn, thisArg);
  }

  contains(value: number, size?: number): boolean {
    return this.arr.some((elem) => elem.contains(value, size));
  }

  /**
   * sort
   * @param cmp
   * @return {Range1D}
   */
  sort(cmp: (a: number, b: number) => number = sortNumeric): Range1D {
    const arr = this.iter().asList();
    const r = arr.sort(cmp);
    return this.fromLike(r);
  }

  private removeDuplicates(size?: number): Range1D {
    let arr = this.iter().asList();
    arr = arr.sort(sortNumeric);
    arr = arr.filter((di, i) => di !== arr[i - 1]); // same value as before, remove
    return Range1D.from(arr);
  }

  /**
   * reverts the order of this range
   */
  reverse(): Range1D {
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

  eq(other: Range1D) {
    if (this === other || (this.isAll && other.isAll) || (this.isNone && other.isNone)) {
      return true;
    }
    // TODO more performant comparison
    return this.toString() === other.toString();
  }

  fromLike(indices: number[]) {
    return Range1D.from(indices);
  }
}

export interface IRange1DGroup extends Range1D {
  fromLike(indices: number[]): IRange1DGroup;
}

export interface ICompositeRange1D extends Range1D {
  groups: IRange1DGroup[];
  fromLikeComposite(groups: IRange1DGroup[]): Range1D;
}
