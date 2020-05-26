/**
 * Created by Samuel Gratzl on 13.03.2017.
 */
export class ValueCache {
   

  private values = new Map<string, any>();

  /**
   * simple delayed caching approach, you hand in the creator functions that is optionally being called
   * @param key key to store
   * @param creator the function to create in case the values not yet cached
   * @return {any}
   */
  public cached<T>(key: string, creator: () => T) {
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
  public cachedLazy<T>(key: string, creator: () => T): (() => T)  {
    return () => this.cached(key, creator);
  }
  private static instance: ValueCache;

  public static getInstance(): ValueCache {
    if (!ValueCache.instance) {
      ValueCache.instance = new ValueCache();
    }
    return ValueCache.instance;
  }
}
