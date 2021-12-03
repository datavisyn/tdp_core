export class ArrayUtils {
    /**
     * search item in array by function
     * @param arr
     * @param f
     * @deprecated use Array.prototype.find
     * @return {T}
     */
    static search(arr, f) {
        let r = undefined;
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
    static indexOf(arr, f) {
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
     * converts the given arguments object into an array
     * @param args
     * @deprecated use Array.from(arguments) instead
     * @internal
     * @returns {*|Array}
     */
    static argList(args) {
        if (arguments.length > 1) {
            return Array.prototype.slice.call(arguments);
        }
        else {
            return Array.prototype.slice.call(args);
        }
    }
    /**
     * array with indices of 0...n-1
     * @param n
     * @returns {any[]}
     */
    static indexRange(n) {
        //http://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
        return Array.apply(null, { length: n }).map(Number.call, Number);
    }
    /**
     * returns the sorted indices of this array, when sorting by the given function
     * @param arr
     * @param compareFn
     * @param thisArg
     */
    static argSort(arr, compareFn, thisArg) {
        const indices = ArrayUtils.indexRange(arr.length);
        return indices.sort((a, b) => {
            return compareFn.call(thisArg, arr[a], arr[b]);
        });
    }
    /**
     * returns the indices, which remain when filtering the given array
     * @param arr
     * @param callbackfn
     * @param thisArg
     */
    static argFilter(arr, callbackfn, thisArg) {
        const indices = ArrayUtils.indexRange(arr.length);
        return indices.filter((value, index) => {
            return callbackfn.call(thisArg, arr[value], index);
        });
    }
}
//# sourceMappingURL=ArrayUtils.js.map