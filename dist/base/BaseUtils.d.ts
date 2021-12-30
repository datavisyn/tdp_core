import { IIterable } from './IIterable';
export declare class BaseUtils {
    /**
     * integrate b into a and override all duplicates
     * @param {Object} a
     * @param {Object} bs
     * @returns {Object} a with extended b
     */
    static mixin<T, U>(a: T, b: U, ...bs: any[]): T & U;
    /**
     * @deprecated use obj === undefined directly
     * @param obj
     * @return {boolean}
     */
    static isUndefined(obj: any): boolean;
    static mod(n: number, m: number): number;
    /**
     * binds the given function to the given context / this arg
     * @deprecated use Function.prototype.bind directly
     * @param f
     * @param thisArg
     * @returns {function(): any}
     */
    static bind(f: () => any, thisArg: any, ...args: any[]): any;
    /**
     * getter generator by name or index
     * @deprecated too simple to write
     */
    static getter(...attr: (number | string)[]): (obj: any) => any;
    /**
     * @deprecated use `typeof(f) === 'function`
     * @param f
     * @return {boolean}
     */
    static isFunction(f: any): boolean;
    /**
     * @deprecated use `(d) => d`
     * identity function
     */
    static identity(d: any): any;
    /**
     * a dummy function, which does exactly nothing, i.e. used as default
     * @deprecated use `()=>undefined`
     */
    static noop(): void;
    /**
     * just returns the argument in any case
     * @deprecated use `() => x`
     * @param r - the value to return
     * @returns {*}
     */
    static constant(r: any): () => any;
    /**
     * special constant function which returns always true, i.e., as a default for a filter function
     * @deprecated use ()=>true
     * @returns {boolean}
     */
    static constantTrue(): boolean;
    /**
     * special constant function which returns always false, i.e., as a default for a filter function
     * @deprecated use ()=>false
     * @returns {boolean}
     */
    static constantFalse(): boolean;
    /**
     * copies a plain object into a function and call a specific method onto direct call
     * @param obj - the
     * @param f
     * @deprecated
     */
    static callable(obj: any, f: string): () => () => void;
    /**
     * generates a random id of the given length
     * @param length length of the id
     * @returns {string}
     */
    static randomId(length?: number): string;
    /**
     * fixes a given name by converting it to plain camelcase
     * @param name
     * @return {string}
     */
    static fixId(name: string): string;
    /**
     * extends class copied from TypeScript compiler
     * @param subClass
     * @param baseClass
     */
    static extendClass(subClass: any, baseClass: any): void;
    /**
     * create a debounce call, can be called multiple times but only the last one at most delayed by timeToDelay will be executed
     * @param callback
     * @param timeToDelay
     * @return {function(...[any]): undefined}
     */
    static debounce(this: any, callback: () => void, timeToDelay?: number): (...args: any[]) => void;
    /**
     * computes the absolute offset of the given element
     * @param element
     * @return {{left: number, top: number, width: number, height: number}}
     */
    static offset(element: Element): {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    /**
     * returns the bounding box of a given element similar to offset
     * @param element
     * @returns {{x: number, y: number, w: number, h: number}}
     */
    static bounds(element: Element): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /**
     * returns a promise that resolves in the given number of milliseconds
     * @param milliseconds the number of milliseconds to resolve
     */
    static resolveIn(milliseconds: number): Promise<void>;
    /**
     * computes the extent [min, max] for the given array, in case of empty array [NaN, NaN] is returned
     * @param arr the array
     * @return {[number,number]} [min, max]
     */
    static extent(arr: IIterable<number>): [number, number];
}
