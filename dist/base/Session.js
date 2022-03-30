export class Session {
    constructor() {
        /**
         * Use the browser's sessionStorage
         * @type {Storage}
         */
        this.context = window.sessionStorage;
    }
    /**
     * Store any value for a given key and returns the previous stored value.
     * Returns `null` if no previous value was found.
     * @param key
     * @param value
     * @returns {any}
     */
    store(key, value) {
        const bak = this.context.getItem(key);
        this.context.setItem(key, JSON.stringify(value));
        return bak;
    }
    /**
     * Removes the key-value pair from the session
     * @param key
     */
    remove(key) {
        this.context.removeItem(key);
    }
    /**
     * Returns true if the key exists in the session. Otherwise returns false.
     * @param key
     * @returns {boolean}
     */
    has(key) {
        return this.context.getItem(key) !== null;
    }
    /**
     * Returns the value for the given key if it exists in the session.
     * Otherwise returns the `default_` parameter, which is by default `null`.
     * @param key
     * @param defaultValue
     * @returns {T}
     */
    retrieve(key, defaultValue = null) {
        return this.has(key) ? JSON.parse(this.context.getItem(key)) : defaultValue;
    }
}
//# sourceMappingURL=Session.js.map