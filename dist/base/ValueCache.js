export class ValueCache {
    constructor() {
        this.values = new Map();
    }
    /**
     * simple delayed caching approach, you hand in the creator functions that is optionally being called
     * @param key key to store
     * @param creator the function to create in case the values not yet cached
     * @return {any}
     */
    cached(key, creator) {
        if (ValueCache.getInstance().values.has(key)) {
            return ValueCache.getInstance().values.get(key);
        }
        const v = creator();
        ValueCache.getInstance().values.set(key, v);
        return v;
    }
    /**
     * Clears the entire value cache.
     */
    clear() {
        this.values.clear();
    }
    /**
     * Deletes one entry specified with a key.
     * @param key Key of the item to be deleted.
     * @returns True if the item was found and deleted, false if the item was not in the cache.
     */
    delete(key) {
        return this.values.delete(key);
    }
    /**
     * similar to @see cached but the result is lazily evaluated
     * @param {string} key key to store
     * @param {() => T} creator the function to create in case the values not yet cached
     * @returns {() => T}
     */
    cachedLazy(key, creator) {
        return () => ValueCache.getInstance().cached(key, creator);
    }
    static getInstance() {
        if (!ValueCache.instance) {
            ValueCache.instance = new ValueCache();
        }
        return ValueCache.instance;
    }
}
//# sourceMappingURL=ValueCache.js.map