export declare class Session {
    /**
     * Use the browser's sessionStorage
     * @type {Storage}
     */
    private context;
    /**
     * Store any value for a given key and returns the previous stored value.
     * Returns `null` if no previous value was found.
     * @param key
     * @param value
     * @returns {any}
     */
    store(key: string, value: any): string;
    /**
     * Removes the key-value pair from the session
     * @param key
     */
    remove(key: string): void;
    /**
     * Returns true if the key exists in the session. Otherwise returns false.
     * @param key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     * Returns the value for the given key if it exists in the session.
     * Otherwise returns the `default_` parameter, which is by default `null`.
     * @param key
     * @param defaultValue
     * @returns {T}
     */
    retrieve<T>(key: string, defaultValue?: T): T;
}
//# sourceMappingURL=Session.d.ts.map