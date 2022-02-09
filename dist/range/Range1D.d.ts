import { IRangeElem } from './internal/internal';
import { IIterator } from '../base/iterator';
export declare class Range1D {
    private readonly arr;
    constructor(arg?: Range1D | IRangeElem[]);
    get length(): number;
    static all(): Range1D;
    static single(item: number): Range1D;
    static none(): Range1D;
    static from(indices: number[]): Range1D;
    private static compress;
    get isAll(): boolean;
    get isNone(): boolean;
    get isUnbound(): boolean;
    private get isList();
    push(...items: (IRangeElem | string | number | [number, number, number])[]): number;
    pushSlice(from: number, to?: number, step?: number): void;
    pushList(indices: number[]): void;
    setSlice(from: number, to?: number, step?: number): void;
    setList(indices: number[]): void;
    at(index: number): IRangeElem;
    size(size?: number): number;
    /**
     * whether this range is the identity, i.e. the first natural numbers starting with 0
     * @return {boolean}
     */
    get isIdentityRange(): boolean;
    repeat(ntimes?: number): Range1D;
    /**
     * combines this range with another and returns a new one
     * this = (1,3,5,7), sub = (1,2) -> (1,2)(1,3,5,7) = (3,5)
     * @returns {Range1D}
     */
    preMultiply(sub: Range1D, size?: number): Range1D;
    /**
     * logical union between two ranges
     * @param other
     * @returns {Range1D}
     */
    union(other: Range1D, size?: number): Range1D;
    /**
     * logical intersection between two ranges
     * @param other
     * @param size
     * @returns {Range1D}
     */
    intersect(other: Range1D, size?: number): Range1D;
    toSet(size?: number): Range1D;
    /**
     * logical difference between two ranges
     * @param without
     * @param size
     * @returns {Range1D}
     */
    without(without: Range1D, size?: number): Range1D;
    /**
     * clones this range
     * @returns {Range1D}
     */
    clone(): Range1D;
    /**
     * inverts the given index to the original range
     * @param index
     * @param size the underlying size for negative indices
     * @returns {number}
     */
    invert(index: number, size?: number): number;
    indexOf(indices: number[]): number[];
    indexOf(index: number): number;
    indexOf(...index: number[]): number[];
    indexOf(r: Range1D, size?: number): Range1D;
    /**
     * returns the range representing the indices of the given range within the current data
     * @param r
     * @param size
     * @return {Range1D}
     */
    indexRangeOf(r: Range1D, size?: number): Range1D;
    /**
     * filters the given data according to this range
     * @param data
     * @param size the total size for resolving negative indices
     * @returns {*}
     */
    filter(data: any[], size?: number, transform?: (v: any) => any): any[];
    /**
     * creates an iterator of this range
     * @param size the underlying size for negative indices
     */
    iter(size?: number): IIterator<number>;
    get __iterator__(): IIterator<number>;
    asList(size?: number): number[];
    get first(): number;
    get last(): number;
    /**
     * for each element
     * @param callbackfn
     * @param thisArg
     */
    forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void;
    contains(value: number, size?: number): boolean;
    /**
     * sort
     * @param cmp
     * @return {Range1D}
     */
    sort(cmp?: (a: number, b: number) => number): Range1D;
    private removeDuplicates;
    /**
     * reverts the order of this range
     */
    reverse(): Range1D;
    toString(): string;
    eq(other: Range1D): boolean;
    fromLike(indices: number[]): Range1D;
}
export interface IRange1DGroup extends Range1D {
    fromLike(indices: number[]): IRange1DGroup;
}
export interface ICompositeRange1D extends Range1D {
    groups: IRange1DGroup[];
    fromLikeComposite(groups: IRange1DGroup[]): Range1D;
}
//# sourceMappingURL=Range1D.d.ts.map