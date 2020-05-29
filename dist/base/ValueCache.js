/**
 * Created by Samuel Gratzl on 13.03.2017.
 */
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
        if (this.values.has(key)) {
            return this.values.get(key);
        }
        const v = creator();
        this.values.set(key, v);
        return v;
    }
    /**
     * similar to @see cached but the result is lazily evaluated
     * @param {string} key key to store
     * @param {() => T} creator the function to create in case the values not yet cached
     * @returns {() => T}
     */
    cachedLazy(key, creator) {
        return () => this.cached(key, creator);
    }
    static getInstance() {
        if (!ValueCache.instance) {
            ValueCache.instance = new ValueCache();
        }
        return ValueCache.instance;
    }
}
//# sourceMappingURL=ValueCache.js.map