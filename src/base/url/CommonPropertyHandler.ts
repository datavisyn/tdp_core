import { PropertyHandler } from './PropertyHandler';

export abstract class CommonPropertyHandler extends PropertyHandler {
  public static readonly EVENT_STATE_PUSHED = 'pushedState';

  public static readonly EVENT_HASH_CHANGED = 'hashChanged';

  private debounceTimer = -1;

  protected updated = () => {
    this.parse(this.propertySource);
    this.fire(CommonPropertyHandler.EVENT_HASH_CHANGED);
  };

  protected init() {
    const bak = window.history.state;
    if (bak) {
      Object.keys(bak).forEach((k) => this.map.set(k, bak[k]));
    } else {
      this.parse(this.propertySource);
    }
  }

  /**
   * Remove event listener, ...
   */
  destroy() {
    // hook
  }

  abstract get propertySource(): string;

  abstract get propertySymbol(): string;

  toURLString(): string {
    return this.propertySymbol + this.toString();
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

  protected toObject() {
    const r: any = {};
    this.map.forEach((v, k) => (r[k] = v));
    return r;
  }

  private update(updateInMs = 0) {
    if (updateInMs <= 0) {
      this.clearDebounceTimer();
      this.updateImpl();
    }

    this.clearDebounceTimer();

    this.debounceTimer = window.setTimeout(() => {
      this.clearDebounceTimer();
      this.updateImpl();
    }, updateInMs);
  }

  private clearDebounceTimer() {
    if (this.debounceTimer <= 0) {
      return;
    }
    window.clearTimeout(this.debounceTimer);
    this.debounceTimer = -1;
  }

  protected abstract updateImpl(): void;

  protected isSameHistoryState(): boolean {
    // check if same state
    if (window.history.state) {
      const current = window.history.state;
      const keys = Object.keys(current);
      if (keys.length === this.map.size && keys.every((k) => this.map.get(k) === current[k])) {
        return true;
      }
    }
    return false;
  }
}
