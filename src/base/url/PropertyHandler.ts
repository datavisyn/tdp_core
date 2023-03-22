import { EventHandler } from '../event';

export class PropertyHandler extends EventHandler {
  static readonly EVENT_CHANGED = 'changed';

  static readonly EVENT_ENTRY_CHANGED = 'entryChanged';

  protected readonly map = new Map<string, any>();

  constructor(code?: string) {
    super();
    if (code) {
      this.parse(code);
    }
  }

  /**
   * returns the contained keys of this property handler
   * @returns {string[]}
   */
  keys() {
    return Array.from(this.map.keys());
  }

  /**
   * iterate over each entry in the map
   * @param f
   */
  forEach(f: (key: string, value: any) => void) {
    this.map.forEach((v, k) => f(k, v));
  }

  /**
   * whether the given name is defined i.e., not null
   * @deprecated use has(name)
   * @param name
   * @returns {boolean}
   */
  is(name: string) {
    return this.has(name);
  }

  has(name: string) {
    return this.getProp(name, null) != null;
  }

  /**
   * returns the given value with optional default value
   * @param name
   * @param defaultValue
   * @returns {any}
   */
  getProp(name: string, defaultValue: string = null) {
    if (this.map.has(name)) {
      const v = this.map.get(name);
      return v === null ? null : v.toString();
    }
    return defaultValue;
  }

  /**
   * returns the given integer value with optional default, the value itself might be encoded to safe space
   * @param name
   * @param defaultValue
   * @returns {number}
   */
  getInt(name: string, defaultValue = NaN) {
    const l: string = this.getProp(name, null);
    if (l === null) {
      return defaultValue;
    }
    return parseInt(l, 10);
  }

  /**
   * removes the property from the map
   * @param name
   * @returns {boolean}
   */
  removeProp(name: string) {
    if (this.map.has(name)) {
      this.fire(PropertyHandler.EVENT_ENTRY_CHANGED + PropertyHandler.MULTI_EVENT_SEPARATOR + PropertyHandler.EVENT_CHANGED, name, this.map.get(name), null);
      this.map.delete(name);
      return true;
    }
    return false;
  }

  toString() {
    const r: string[] = [];
    this.map.forEach((v, key) => {
      r.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
    });
    return r.join('&');
  }

  protected parse(code = '') {
    // if available use https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    const oldLength = this.map.size;
    this.map.clear();
    if (code.length <= 1) {
      // just the starting character ? or #
      if (oldLength !== 0) {
        this.fire(PropertyHandler.EVENT_CHANGED);
      }
      return;
    }
    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/21152762#21152762
    code
      .substring(1)
      .split('&')
      .forEach((item) => {
        const s = item.split('=');
        const k = decodeURIComponent(s[0]);
        const v = s[1] && decodeURIComponent(s[1]);
        if (this.map.has(k)) {
          const old = this.map.get(k);
          if (!Array.isArray(old)) {
            this.map.set(k, [old, v]);
          } else {
            this.map.get(k).push(v);
          }
        } else {
          this.map.set(k, v);
        }
      });

    this.fire(PropertyHandler.EVENT_CHANGED);
  }
}

export const propertyHandler = new PropertyHandler(window.location.search);
