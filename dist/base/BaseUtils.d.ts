export declare class BaseUtils {
    static mod(n: number, m: number): number;
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
    static extent(arr: number[]): [number, number];
}
/**
 * Debounces a function returning a promise and properly returns a promise resolving when the function is finally evaluated.
 * See https://github.com/lodash/lodash/issues/4400 for details why lodash#debounce does not work in cases like this.
 * @param callback Function to be debounced.
 * @param wait Wait time in milliseconds.
 */
export declare function debounceAsync<T, Callback extends (...args: any[]) => Promise<T>>(callback: Callback, wait: number): (...args: Parameters<Callback>) => Promise<T>;
//# sourceMappingURL=BaseUtils.d.ts.map