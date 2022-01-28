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
     * Clears the entire value cache.
     */
    clear(): void;
    /**
     * Deletes one entry specified with a key.
     * @param key Key of the item to be deleted.
     * @returns True if the item was found and deleted, false if the item was not in the cache.
     */
    delete(key: string): boolean;
    /**
     * similar to @see cached but the result is lazily evaluated
     * @param {string} key key to store
     * @param {() => T} creator the function to create in case the values not yet cached
     * @returns {() => T}
     */
    cachedLazy<T>(key: string, creator: () => T): () => T;
    private static instance;
    static getInstance(): ValueCache;
}
//# sourceMappingURL=ValueCache.d.ts.map