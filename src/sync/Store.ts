import { EventHandler } from '../base/event';

export interface IChangedHandler {
  (newValue: any, oldValue: any, url: string);
}

export class Store extends EventHandler {
  static EVENT_CHANGED = '_change';

  constructor(private storage: Storage, private prefix: string) {
    super();

    window.addEventListener('storage', (event: StorageEvent) => {
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

  private toFullKey(key: string) {
    return this.prefix + key;
  }

  setValue(key: string, value: any) {
    key = this.toFullKey(key);
    const bak = this.storage.getItem(key);
    this.storage.setItem(key, this.stringify(value));
    return bak;
  }

  deleteValue(key: string) {
    key = this.toFullKey(key);
    this.storage.removeItem(key);
  }

  includes(key: string) {
    key = this.toFullKey(key);
    return this.storage.getItem(key) !== null;
  }

  getValue<T>(key: string, defaultValue: T = null): T {
    key = this.toFullKey(key);
    const v = this.storage.getItem(key);
    return v !== null ? this.parse(v) : defaultValue;
  }

  parse(v: string) {
    return v === null ? null : JSON.parse(v);
  }

  stringify(v: any) {
    return JSON.stringify(v);
  }
}
