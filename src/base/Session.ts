export class Session {
  /**
   * Use the browser's sessionStorage
   * @type {Storage}
   */
  private context: Storage = sessionStorage;

  /**
   * Store any value for a given key and returns the previous stored value.
   * Returns `null` if no previous value was found.
   * @param key
   * @param value
   * @returns {any}
   */
  public store(key: string, value: any) {
    const bak = this.context.getItem(key);
    this.context.setItem(key, JSON.stringify(value));
    return bak;
  }

  /**
   * Removes the key-value pair from the session
   * @param key
   */
  public remove(key: string) {
    this.context.removeItem(key);
  }

  /**
   * Returns true if the key exists in the session. Otherwise returns false.
   * @param key
   * @returns {boolean}
   */
  public has(key: string) {
    return (this.context.getItem(key) !== null);
  }

  /**
   * Returns the value for the given key if it exists in the session.
   * Otherwise returns the `default_` parameter, which is by default `null`.
   * @param key
   * @param defaultValue
   * @returns {T}
   */
  public retrieve<T>(key: string, defaultValue: T = null): T {
    return this.has(key) ? JSON.parse(this.context.getItem(key)) : defaultValue;
  }

}
