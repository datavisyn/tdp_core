export class ArrayUtils {
  /**
   * search item in array by function
   * @param arr
   * @param f
   * @deprecated use Array.prototype.find
   * @return {T}
   */
  static search<T>(arr: T[], f: (v: T) => boolean): T {
    let r: T;
    arr.some((v) => {
      if (f(v)) {
        r = v;
        return true;
      }
      return false;
    });
    return r;
  }

  /**
   *
   * @deprecated use Array.prototype.findIndex
   * @param arr
   * @param f
   * @return {number}
   */
  static indexOf<T>(arr: T[], f: (v: T) => boolean): number {
    let r = -1;
    arr.some((v, i) => {
      if (f(v)) {
        r = i;
        return true;
      }
      return false;
    });
    return r;
  }

  /**
   * array with indices of 0...n-1
   * @param n
   * @returns {any[]}
   */
  static indexRange(n: number): number[] {
    return Array.from(Array(n).keys());
  }

  /**
   * returns the sorted indices of this array, when sorting by the given function
   * @param arr
   * @param compareFn
   * @param thisArg
   */
  static argSort<T>(arr: T[], compareFn?: (a: T, b: T) => number, thisArg?: any): number[] {
    const indices = ArrayUtils.indexRange(arr.length);
    return indices.sort((a: any, b: any) => {
      return compareFn.call(thisArg, arr[a], arr[b]);
    });
  }

  /**
   * returns the indices, which remain when filtering the given array
   * @param arr
   * @param callbackfn
   * @param thisArg
   */
  static argFilter<T>(arr: T[], callbackfn: (value: T, index: number) => boolean, thisArg?: any): number[] {
    const indices = ArrayUtils.indexRange(arr.length);
    return indices.filter((value: number, index: number) => {
      return callbackfn.call(thisArg, arr[value], index);
    });
  }
}
