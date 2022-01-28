import { EventHandler } from '../base/event';
export class Store extends EventHandler {
    constructor(storage, prefix) {
        super();
        this.storage = storage;
        this.prefix = prefix;
        window.addEventListener('storage', (event) => {
            if (event.storageArea === storage && event.key.startsWith(prefix)) {
                const key = event.key.substring(prefix.length);
                // send specific and generic event
                const newValue = this.parse(event.newValue);
                const oldValue = this.parse(event.oldValue);
                this.fire(key, newValue, oldValue, event.url);
                this.fire(Store.EVENT_CHANGED, key, newValue, oldValue, event.url);
            }
        });
    }
    toFullKey(key) {
        return this.prefix + key;
    }
    setValue(key, value) {
        key = this.toFullKey(key);
        const bak = this.storage.getItem(key);
        this.storage.setItem(key, this.stringify(value));
        return bak;
    }
    deleteValue(key) {
        key = this.toFullKey(key);
        this.storage.removeItem(key);
    }
    includes(key) {
        key = this.toFullKey(key);
        return this.storage.getItem(key) !== null;
    }
    getValue(key, defaultValue = null) {
        key = this.toFullKey(key);
        const v = this.storage.getItem(key);
        return v !== null ? this.parse(v) : defaultValue;
    }
    parse(v) {
        return v === null ? null : JSON.parse(v);
    }
    stringify(v) {
        return JSON.stringify(v);
    }
}
Store.EVENT_CHANGED = '_change';
//# sourceMappingURL=Store.js.map