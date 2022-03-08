/**
 * basic iterator interface
 * @deprecated use native iterator concept
 */
export interface IIterator<T> {
    hasNext(): boolean;
    next(): T;
    /**
     * converts this whole itertor into an array
     */
    asList(): T[];
    isIncreasing: boolean;
    isDecreasing: boolean;
    /**
     * increases by one
     */
    byOne: boolean;
    /**
     * decreases by one
     */
    byMinusOne: boolean;
    forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T) => U, thisArg?: any): IIterator<U>;
}
export declare class AIterator<T> {
    hasNext(): boolean;
    next(): T;
    forEach(callbackfn: (value: T, index: number) => void, thisArg?: any): void;
    /**
     * Calls a defined callback function on each element of an array, and returns an array that contains the results.
     * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
     * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
     */
    map<U>(callbackfn: (value: T) => U, thisArg?: any): IIterator<U>;
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList(): any[];
    get isIncreasing(): boolean;
    get isDecreasing(): boolean;
    get byOne(): boolean;
    get byMinusOne(): boolean;
}
/**
 * iterator for a given range
 */
export declare class Iterator extends AIterator<number> implements IIterator<number> {
    from: number;
    to: number;
    step: number;
    private act;
    constructor(from: number, to: number, step: number);
    /**
     * whether more items are available
     */
    hasNext(): boolean;
    /**
     * returns the next item
     */
    next(): number;
    get isIncreasing(): boolean;
    get isDecreasing(): boolean;
    get byOne(): boolean;
    get byMinusOne(): boolean;
    get size(): number;
    /**
     * creates a new iterator for the given range
     * @param from
     * @param to
     * @param step
     * @returns {Iterator}
     */
    static create(from: number, to: number, step: number): Iterator;
}
export declare class ListIterator<T> extends AIterator<T> implements IIterator<T> {
    arr: T[];
    private it;
    constructor(arr: T[]);
    /**
     * whether more items are available
     */
    hasNext(): boolean;
    /**
     * returns the next item
     */
    next(): T;
    asList(): T[];
    /**
     * creates a new iterator for the given list
     * @param arr
     * @returns {ListIterator}
     */
    static create<T>(arr: T[]): ListIterator<T>;
}
export declare class SingleIterator<T> extends AIterator<T> implements IIterator<T> {
    private value;
    private delivered;
    constructor(value: T);
    hasNext(): boolean;
    next(): T;
    asList(): T[];
    get isIncreasing(): boolean;
    get isDecreasing(): boolean;
    get byOne(): boolean;
    get byMinusOne(): boolean;
    static create(value: number): SingleIterator<number>;
}
/**
 * @deprecated use native iterator concept
 */
export declare class EmptyIterator<T> extends AIterator<T> implements IIterator<T> {
    private _isIncreasing;
    get isIncreasing(): boolean;
    set isIncreasing(value: boolean);
    private _isDecreasing;
    get isDecreasing(): boolean;
    set isDecreasing(value: boolean);
    private _byOne;
    get byOne(): boolean;
    set byOne(value: boolean);
    private _byMinusOne;
    get byMinusOne(): boolean;
    set byMinusOne(value: boolean);
    /**
     * whether more items are available
     */
    hasNext(): boolean;
    /**
     * returns the next item
     */
    next(): T;
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList(): T[];
    static create<T>(): EmptyIterator<T>;
}
export declare class ConcatIterator<T> extends AIterator<T> implements IIterator<T> {
    private its;
    private act;
    constructor(its: IIterator<T>[]);
    /**
     * whether more items are available
     */
    hasNext(): boolean;
    /**
     * returns the next item
     */
    next(): T;
    /**
     * converts the remaining of this iterator to a list
     * @returns {Array}
     */
    asList(): any[];
    get isIncreasing(): boolean;
    get isDecreasing(): boolean;
    get byOne(): boolean;
    get byMinusOne(): boolean;
    static concatIterators<T>(...its: IIterator<T>[]): IIterator<T> | EmptyIterator<unknown> | ConcatIterator<T>;
}
//# sourceMappingURL=iterator.d.ts.map