/* eslint-disable prefer-rest-params */
import { Range1D } from './Range1D';
import type { IRangeSlice } from './IRangeSlice';
/**
 * multi dimensional version of a RangeDim
 */
export class Range {
  constructor(public readonly dims: Range1D[] = []) {}

  /**
   * checks if this range is all
   * @returns {boolean}
   */
  get isAll() {
    return this.dims.every((dim) => dim.isAll);
  }

  get isNone() {
    return this.dims.every((dim) => dim.isNone);
  }

  /**
   * checks whether there are any wildcards
   */
  get isUnbound() {
    return this.dims.some((dim) => dim.isUnbound);
  }

  get first() {
    return this.dim(0).first;
  }

  get last() {
    return this.dim(0).last;
  }

  /**
   * number of defined dimensions
   * @returns {number}
   */
  get ndim() {
    return this.dims.length;
  }

  eq(other: Range) {
    if (this === other || (this.isAll && other.isAll) || (this.isNone && other.isNone)) {
      return true;
    }
    // TODO more performant comparison
    return this.toString() === other.toString();
  }

  /**
   * combines this range with another and returns a new one
   * this = (1,3,5,7), other = (1,2) -> (1,2)(1,3,5,7) = (3,5)
   * @param other
   * @returns {*}
   */
  preMultiply(other: Range, size?: number[]) {
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    const r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.preMultiply(other.dim(i), size ? size[i] : undefined);
    });
    return r;
  }

  union(other: Range, size?: number[]) {
    if (this.isAll || other.isNone) {
      return this.clone();
    }
    if (other.isAll || this.isNone) {
      return other.clone();
    }
    const r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.union(other.dim(i), size ? size[i] : undefined);
    });
    return r;
  }

  /**
   * logical intersection between two ranges
   * @param other
   * @returns {RangeDim}
   */
  intersect(other: Range, size?: number[]) {
    if (this.isNone || other.isNone) {
      return Range.none();
    }
    if (this.isAll) {
      return other.clone();
    }
    if (other.isAll) {
      return this.clone();
    }
    const r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.intersect(other.dim(i), size ? size[i] : undefined);
    });
    return r;
  }

  without(without: Range, size?: number[]) {
    if (this.isNone || without.isNone) {
      return this.clone();
    }
    if (without.isAll) {
      return Range.none();
    }
    const r = new Range();
    this.dims.forEach((d, i) => {
      r.dims[i] = d.without(without.dim(i), size ? size[i] : undefined);
    });
    return r;
  }

  /**
   * clones this range
   * @returns {*}
   */
  clone() {
    const r = new Range();
    this.dims.forEach(function (d, i) {
      r.dims[i] = d.clone();
    });
    return r;
  }

  /**
   * create a new range and reverse the dimensions
   */
  swap() {
    return new Range(this.dims.map((d) => d.clone()).reverse());
  }

  /**
   * filter the given multi dimensional data according to the current range
   * @param data
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  filter(data: any[], size?: number[]) {
    if (this.isAll) {
      return data;
    }
    const { ndim } = this;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    // recursive variant for just filtering the needed rows
    const filterDim = (i: number): ((d: any) => any) => {
      if (i >= ndim) {
        // out of range no filtering anymore
        return (d: any) => d;
      }
      const d = that.dim(i);
      const next = filterDim(i + 1); // compute next transform
      const s = size ? size[i] : undefined;
      return (elem: any[] | any) => {
        // if the value is an array, filter it else return the value
        return Array.isArray(elem) ? d.filter(elem, s, next) : elem;
      };
    };

    const f = filterDim(0);

    return f(data);
  }

  /**
   * return a specific dimension
   * @param dimension
   * @returns {r}
   */
  dim(dimension: number): Range1D {
    const r = this.dims[dimension];
    if (r) {
      return r;
    }
    // not yet existing create one
    this.dims[dimension] = Range1D.all();
    return this.dims[dimension];
  }

  /**
   * transforms the given multi dimensional indices to their parent notation
   * @param indices
   * @param size the underlying size for negative indices
   */
  invert(indices: number[], size?: number[]): number[] {
    if (this.isAll) {
      return indices;
    }
    return indices.map((index, i) => {
      return this.dim(i).invert(index, size ? size[i] : undefined);
    });
  }

  indexRangeOf(r: Range, size?: number[]): Range {
    if (r.isNone || this.isNone) {
      return Range.none();
    }
    if (this.isNone || r.isAll) {
      return this.clone();
    }
    return new Range(this.dims.map((d, i) => d.indexRangeOf(r.dim(i), size ? size[i] : undefined)));
  }

  indexOf(indices: number[]): number[];

  indexOf(index: number): number;

  indexOf(...index: number[]): number[];

  indexOf(r: Range, size?: number[]): Range;

  indexOf(): any {
    if (arguments[0] instanceof Range) {
      return this.indexRangeOf(arguments[0], arguments[1]);
    }
    let arr: number[];
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'number') {
        return this.dim(0).indexOf(<number>arguments[0]);
      }
      arr = arguments[0];
    } else {
      arr = Array.from(arguments);
    }
    if (arr.length === 0) {
      return [];
    }
    return arr.map((index, i) => this.dim(i).indexOf(index));
  }

  /**
   * returns the range size
   * @param size the underlying size for negative indices
   * @returns {*}
   */
  size(size?: number[]): number[] {
    if (this.isAll) {
      return size;
    }
    return this.dims.map((r, i) => {
      return r.size(size ? size[i] : undefined);
    });
  }

  split(): Range[] {
    return this.dims.map((dim) => {
      return new Range([dim]);
    });
  }

  /**
   * iterates over the product of this range, e.g. (0,1,2),(3) => (0,3),(1,3),(2,3)
   * @param callback
   * @param size
   */
  product(callback: (indices: number[]) => void, size?: number[]) {
    const { ndim } = this;
    const iter = (ids: number[]) => {
      const act = ids.length;
      if (act < ndim) {
        const dim = this.dims[act];
        dim.iter(size ? size[act] : null).forEach((id) => {
          ids.push(id);
          iter(ids);
          ids.pop();
        });
      } else {
        callback(ids.slice());
      }
    };
    iter([]);
  }

  /**
   * encoded the given range in a string
   */
  toString() {
    return this.dims
      .map(function (d) {
        return d.toString();
      })
      .join(',');
  }

  /**
   * creates a new range including everything
   * @returns {Range}
   */
  static all() {
    return new Range();
  }

  static none() {
    // ensure two dimensions
    return new Range([Range1D.none(), Range1D.none()]);
  }

  /**
   * Tests if the given object is a range
   */
  static isRange(obj: any) {
    return obj instanceof Range;
  }

  /**
   * TODO document
   * @param dimIndices
   * @return {any}
   */
  static cell(...dimIndices: number[]) {
    return new Range(dimIndices.map(Range1D.single));
  }

  /**
   * Creates a new range starting at from and optionally up to 'to' and optionally with a step
   * @param from the index where the range starts (included)
   * @param to the index where the range ends (excluded), defaults to the end of the data structure
   * @param step the step size, defaults to 1
   */
  static range(from: number, to?: number, step?: number): Range;
  /**
   * Creates a new multidimensional range using step functions.
   * @param ranges Each array can contain up to three indices, the first is read as 'from',
   * the second as 'to' and the third as 'step'. IRangeSlice explicitly defines from/to/step.
   */
  static range(...ranges: (number[] | IRangeSlice)[]): Range;
  /**
   * Creates a new range that includes all elements in the data structure
   * @returns {any}
   */
  static range() {
    if (arguments.length === 0) {
      return Range.all();
    }
    const r = new Range();
    if (Array.isArray(arguments[0])) {
      // array mode
      Array.from(arguments).forEach((arr: number[], i) => {
        if (arr.length === 0) {
          return;
        }
        r.dim(i).setSlice(arr[0], arr[1], arr[2]);
      });
    } else if (Object.prototype.toString.call(arguments[0]) === '[object Object]') {
      // slice object mode
      Array.from(arguments).forEach((slice: IRangeSlice, i) => {
        r.dim(i).setSlice(slice.from, slice.to, slice.step);
      });
    } else if (typeof arguments[0] === 'number') {
      // single slice mode
      r.dim(0).setSlice(arguments[0], arguments[1], arguments[2]);
    }
    return r;
  }

  /**
   * Creates a new range from a list of indices
   * @param dimsOrIndicesOrIndexArray
   */
  static list(...dimsOrIndicesOrIndexArray: (Range1D | number[] | number)[]): Range;
  static list(dims: Range1D[]): Range;
  static list(): Range {
    if (arguments.length === 0) {
      return Range.all();
    }
    if (Array.isArray(arguments[0]) && arguments[0][0] instanceof Range1D) {
      return new Range(arguments[0]);
    }
    if (Array.isArray(arguments[0])) {
      // array mode
      const r = new Range();
      Array.from(arguments).forEach((arr: any, i) => {
        if (arr instanceof Range1D) {
          r.dims[i] = arr;
        } else {
          r.dim(i).setList(arr);
        }
      });
      return r;
    }
    if (typeof arguments[0] === 'number') {
      // single slice mode
      const r = new Range();
      r.dim(0).setList(Array.from(arguments));
      return r;
    }
    if (arguments[0] instanceof Range1D) {
      return new Range(Array.from(arguments));
    }
    return Range.none();
  }

  /**
   * Joins the specified ranges into a multidimensional range. If no ranges are provided as parameter,
   * returns a new range that includes all elements.
   * @param ranges the ranges to be joined. If the supplied range is a multidimensional range,
   * then the first one is used, the rest is ignored.
   * @return a multidimensional range.
   */
  static join(ranges: Range[]): Range;
  static join(...ranges: Range[]): Range;
  static join() {
    if (arguments.length === 0) {
      return Range.all();
    }
    let ranges = arguments[0];
    if (!Array.isArray(ranges)) {
      // array mode
      ranges = Array.from(arguments);
    }
    return new Range(ranges.map((r: Range) => r.dim(0)));
  }
}
