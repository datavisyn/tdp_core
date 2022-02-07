import { PropertyHandler } from './PropertyHandler';
/**
 * manages the hash location property helper
 */
export class HashProperties extends PropertyHandler {
  public static readonly EVENT_STATE_PUSHED = 'pushedState';

  public static readonly EVENT_HASH_CHANGED = 'hashChanged';

  private updated = () => {
    this.parse(window.location.hash);
    this.fire(HashProperties.EVENT_HASH_CHANGED);
  };

  private debounceTimer = -1;

  constructor() {
    super();
    const bak = window.history.state;
    if (bak) {
      Object.keys(bak).forEach((k) => this.map.set(k, bak[k]));
    } else {
      this.parse(window.location.hash);
    }
    window.addEventListener('hashchange', this.updated, false);
  }

  setInt(name: string, value: number, update: boolean | number = true) {
    this.setProp(name, String(value), update);
  }

  setProp(name: string, value: string, update: boolean | number = true) {
    if (this.map.get(name) === value) {
      return;
    }
    this.map.set(name, value);
    if (update !== false) {
      this.update(typeof update === 'number' ? update : 0);
    }
  }

  removeProp(name: string, update: boolean | number = true) {
    if (this.map.has(name)) {
      this.map.delete(name);
      if (update !== false) {
        this.update(typeof update === 'number' ? update : 0);
      }
      return true;
    }
    return false;
  }

  private toObject() {
    const r: any = {};
    this.map.forEach((v, k) => (r[k] = v));
    return r;
  }

  private update(updateInMs = 0) {
    if (updateInMs <= 0) {
      return this.updateImpl();
    }

    if (this.debounceTimer >= 0) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = -1;
    }
    this.debounceTimer = window.setTimeout(() => this.updateImpl(), updateInMs);
    return undefined;
  }

  private updateImpl() {
    if (this.debounceTimer >= 0) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = -1;
    }
    // check if same state
    if (window.history.state) {
      const current = window.history.state;
      const keys = Object.keys(current);
      if (keys.length === this.map.size && keys.every((k) => this.map.get(k) === current[k])) {
        return;
      }
    }
    window.removeEventListener('hashchange', this.updated, false);
    window.history.pushState(this.toObject(), `State ${Date.now()}`, `#${this.toString()}`);
    window.addEventListener('hashchange', this.updated, false);
    this.fire(HashProperties.EVENT_STATE_PUSHED, `State ${Date.now()}`, `#${this.toString()}`);
  }
}
