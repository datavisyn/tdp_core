import { IRangeElem } from './IRangeElem';
import { RangeUtils } from './RangeUtils';
import { Iterator, IIterator } from '../../base/iterator';
import { SingleRangeElem } from './SingleRangeElem';

export class RangeElem implements IRangeElem {
  constructor(public readonly from: number, public readonly to: number = -1, public readonly step: number = 1) {
    if (step === 0) {
      throw new Error(`invalid step size: ${step}`);
    }
  }

  get isAll() {
    return this.from === 0 && this.to === -1 && this.step === 1;
  }

  get isSingle() {
    return this.from + this.step === this.to;
  }

  get isUnbound() {
    return this.from < 0 || this.to < 0;
  }

  static all() {
    return new RangeElem(0, -1, 1);
  }

  static none() {
    return new RangeElem(0, 0, 1);
  }

  static single(val: number) {
    return new SingleRangeElem(val);
  }

  static range(from: number, to = -1, step = 1) {
    if (from + step === to) {
      return RangeElem.single(from);
    }
    return new RangeElem(from, to, step);
  }

  size(size?: number): number {
    const t = RangeUtils.fixRange(this.to, size);
    const f = RangeUtils.fixRange(this.from, size);
    if (this.step === 1) {
      return Math.max(t - f, 0);
    }
    if (this.step === -1) {
      if (this.to === -1) {
        return Math.max(f - -1, 0);
      }
      return Math.max(f - t, 0);
    }
    const d = this.step > 0 ? t - f + 1 : f - t + 1;
    const s = Math.abs(this.step);
    if (d <= 0) {
      // no range
      return 0;
    }
    return Math.floor(d / s);
  }

  clone() {
    return new RangeElem(this.from, this.to, this.step);
  }

  reverse() {
    if (this.step > 0) {
      const t = this.from - 1;
      const f = this.to - 1;
      return new RangeElem(f, t, -this.step);
    } // step <0
    const t = this.from - 1;
    const f = this.to - 1;
    return new RangeElem(f, t, -this.step);
  }

  invert(index: number, size?: number) {
    if (this.isAll) {
      return index;
    }
    return RangeUtils.fixRange(this.from, size) + index * this.step;
  }

  /**
   * creates an iterator of this range
   * @param size the underlying size for negative indices
   */
  iter(size?: number): IIterator<number> {
    if (this.step < 0 && this.to === -1) {
      // keep negative to have 0 included
      return Iterator.create(RangeUtils.fixRange(this.from, size), -1, this.step);
    }
    return Iterator.create(RangeUtils.fixRange(this.from, size), RangeUtils.fixRange(this.to, size), this.step);
  }

  get __iterator__() {
    return this.iter();
  }

  contains(value: number, size?: number) {
    if (this.isAll) {
      return true;
    }
    const f = RangeUtils.fixRange(this.from, size);
    const t = RangeUtils.fixRange(this.to, size);
    if (this.step === -1) {
      if (this.to === -1) {
        return value <= f && value >= 0;
      }
      return value <= f && value > t;
    }
    if (this.step === +1) {
      // +1
      return value >= f && value < t;
    }
    return this.iter(size).asList().indexOf(value) >= 0;
  }

  toString() {
    if (this.isAll) {
      return '';
    }
    if (this.isSingle) {
      return this.from.toString();
    }
    let r = `${this.from}:${this.to}`;
    if (this.step !== 1) {
      r += `:${this.step}`;
    }
    return r;
  }

  static parse(code: string) {
    if (code.length === 0) {
      return RangeElem.all();
    }
    const parseElem = (v: string, defaultValue = NaN) => {
      v = v.trim();
      if (v === '' && !Number.isNaN(defaultValue)) {
        return defaultValue;
      }
      const n = parseInt(v, 10);
      if (Number.isNaN(n)) {
        throw Error(`parse error: "${v}" is not a valid integer`);
      }
      return n;
    };
    const parts = code.split(':');
    switch (parts.length) {
      case 1:
        return RangeElem.single(parseElem(parts[0]));
      case 2:
        return new RangeElem(parseElem(parts[0], 0), parseElem(parts[1], -1));
      case 3:
        return new RangeElem(parseElem(parts[0], 0), parseElem(parts[1], -1), parseElem(parts[2], 1));
      default:
        throw new Error(`parse error: "${code}" is not a valid range specifier`);
    }
  }
}
