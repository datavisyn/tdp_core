export declare class ArrayUtils {
    /**
     * search item in array by function
     * @param arr
     * @param f
     * @deprecated use Array.prototype.find
     * @return {T}
     */
    static search<T>(arr: T[], f: (v: T) => boolean): T;
    /**
     *
     * @deprecated use Array.prototype.findIndex
     * @param arr
     * @param f
     * @return {number}
     */
    static indexOf<T>(arr: T[], f: (v: T) => boolean): number;
    /**
     * array with indices of 0...n-1
     * @param n
     * @returns {any[]}
     */
    static indexRange(n: number): number[];
    /**
     * returns the sorted indices of this array, when sorting by the given function
     * @param arr
     * @param compareFn
     * @param thisArg
     */
    static argSort<T>(arr: T[], compareFn?: (a: T, b: T) => number, thisArg?: any): number[];
    /**
     * returns the indices, which remain when filtering the given array
     * @param arr
     * @param callbackfn
     * @param thisArg
     */
    static argFilter<T>(arr: T[], callbackfn: (value: T, index: number) => boolean, thisArg?: any): number[];
}
//# sourceMappingURL=ArrayUtils.d.ts.map