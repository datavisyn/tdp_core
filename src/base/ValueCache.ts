export class ValueCache {
  private values = new Map<string, any>();

  /**
   * simple delayed caching approach, you hand in the creator functions that is optionally being called
   * @param key key to store
   * @param creator the function to create in case the values not yet cached
   * @return {any}
   */
  public cached<T>(key: string, creator: () => T) {
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
  public clear(): void {
    this.values.clear();
  }

  /**
   * Deletes one entry specified with a key.
   * @param key Key of the item to be deleted.
   * @returns True if the item was found and deleted, false if the item was not in the cache.
   */
  public delete(key: string): boolean {
    return this.values.delete(key);
  }

  /**
   * similar to @see cached but the result is lazily evaluated
   * @param {string} key key to store
   * @param {() => T} creator the function to create in case the values not yet cached
   * @returns {() => T}
   */
  public cachedLazy<T>(key: string, creator: () => T): () => T {
    return () => ValueCache.getInstance().cached(key, creator);
  }

  private static instance: ValueCache;

  public static getInstance(): ValueCache {
    if (!ValueCache.instance) {
      ValueCache.instance = new ValueCache();
    }
    return ValueCache.instance;
  }
}
