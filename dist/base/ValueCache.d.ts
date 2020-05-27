/**
 * Created by Samuel Gratzl on 13.03.2017.
 */
export declare class ValueCache {
    private values;
    /**
     * simple delayed caching approach, you hand in the creator functions that is optionally being called
     * @param key key to store
     * @param creator the function to create in case the values not yet cached
     * @return {any}
     */
    cached<T>(key: string, creator: () => T): any;
    /**
     * similar to @see cached but the result is lazily evaluated
     * @param {string} key key to store
     * @param {() => T} creator the function to create in case the values not yet cached
     * @returns {() => T}
     */
    cachedLazy<T>(key: string, creator: () => T): (() => T);
    private static instance;
    static getInstance(): ValueCache;
}
