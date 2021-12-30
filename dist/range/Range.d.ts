import { Range1D } from './Range1D';
import { IRangeSlice } from './IRangeSlice';
/**
 * multi dimensional version of a RangeDim
 */
export declare class Range {
    readonly dims: Range1D[];
    constructor(dims?: Range1D[]);
    /**
     * checks if this range is all
     * @returns {boolean}
     */
    get isAll(): boolean;
    get isNone(): boolean;
    /**
     * checks whether there are any wildcards
     */
    get isUnbound(): boolean;
    get first(): number;
    get last(): number;
    /**
     * number of defined dimensions
     * @returns {number}
     */
    get ndim(): number;
    eq(other: Range): boolean;
    /**
     * combines this range with another and returns a new one
     * this = (1,3,5,7), other = (1,2) -> (1,2)(1,3,5,7) = (3,5)
     * @param other
     * @returns {*}
     */
    preMultiply(other: Range, size?: number[]): Range;
    union(other: Range, size?: number[]): Range;
    /**
     * logical intersection between two ranges
     * @param other
     * @returns {RangeDim}
     */
    intersect(other: Range, size?: number[]): Range;
    without(without: Range, size?: number[]): Range;
    /**
     * clones this range
     * @returns {*}
     */
    clone(): Range;
    /**
     * create a new range and reverse the dimensions
     */
    swap(): Range;
    /**
     * filter the given multi dimensional data according to the current range
     * @param data
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    filter(data: any[], size?: number[]): any;
    /**
     * return a specific dimension
     * @param dimension
     * @returns {r}
     */
    dim(dimension: number): Range1D;
    /**
     * transforms the given multi dimensional indices to their parent notation
     * @param indices
     * @param size the underlying size for negative indices
     */
    invert(indices: number[], size?: number[]): number[];
    indexRangeOf(r: Range, size?: number[]): Range;
    indexOf(indices: number[]): number[];
    indexOf(index: number): number;
    indexOf(...index: number[]): number[];
    indexOf(r: Range, size?: number[]): Range;
    /**
     * returns the range size
     * @param size the underlying size for negative indices
     * @returns {*}
     */
    size(size?: number[]): number[];
    split(): Range[];
    /**
     * iterates over the product of this range, e.g. (0,1,2),(3) => (0,3),(1,3),(2,3)
     * @param callback
     * @param size
     */
    product(callback: (indices: number[]) => void, size?: number[]): void;
    /**
     * encoded the given range in a string
     */
    toString(): string;
    /**
     * creates a new range including everything
     * @returns {Range}
     */
    static all(): Range;
    static none(): Range;
    /**
     * Tests if the given object is a range
     */
    static isRange(obj: any): boolean;
    /**
     * TODO document
     * @param dimIndices
     * @return {any}
     */
    static cell(...dimIndices: number[]): Range;
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
     * Creates a new range from a list of indices
     * @param dimsOrIndicesOrIndexArray
     */
    static list(...dimsOrIndicesOrIndexArray: (Range1D | number[] | number)[]): Range;
    static list(dims: Range1D[]): Range;
    /**
     * Joins the specified ranges into a multidimensional range. If no ranges are provided as parameter,
     * returns a new range that includes all elements.
     * @param ranges the ranges to be joined. If the supplied range is a multidimensional range,
     * then the first one is used, the rest is ignored.
     * @return a multidimensional range.
     */
    static join(ranges: Range[]): Range;
    static join(...ranges: Range[]): Range;
}
