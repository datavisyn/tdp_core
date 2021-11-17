import {Range} from '../range/Range';
import {Range1D} from '../range/Range1D';
import {CompositeRange1D} from '../range/CompositeRange1D';
import {IIterable} from '../base/IIterable';


export interface IHistogram extends IIterable<number> {
  readonly bins: number;
  readonly largestFrequency: number;
  /**
   * largest frequency without missing
   */
  readonly largestBin: number;
  readonly count: number;
  /**
   * number of valid entries;
   */
  readonly validCount: number;

  frequency(bin: number): number;
  range(bin: number): Range;

  binOf(value: any): number;

  readonly missing: number;
  readonly missingRange: Range;

  forEach(callbackfn: (value: number, index: number) => void, thisArg?: any): void;
}

export interface ICatHistogram extends IHistogram {
  readonly categories: string[];
  readonly colors: string[];
}

export class AHistogram implements IHistogram {
  private _bins: number[];
  private _missing: number = 0;
  private _ranges: Range[];
  private _missingRange = Range.none();

  constructor(bins: number, hist?: number[]) {
    this._bins = [];
    for (let i = 0; i < bins; ++i) {
      this._bins.push(hist && hist.length > i ? hist[i] : 0);
    }
  }

  get largestFrequency() {
    return Math.max(Math.max.apply(Math, this._bins), this._missing);
  }

  get largestBin() {
    return Math.max.apply(Math, this._bins);
  }

  get count() {
    return this.validCount + this._missing;
  }

  get validCount() {
    return this._bins.reduce((p, s) => p + s, 0);
  }

  get bins() {
    return this._bins.length;
  }

  binOf(value: any) {
    return -1;
  }

  frequency(bin: number) {
    return this._bins[bin];
  }

  range(bin: number) {
    return this._ranges ? this._ranges[bin] : Range.none();
  }

  get missing() {
    return this._missing;
  }

  get missingRange() {
    return this._missingRange;
  }

  pushAll(arr: IIterable<any>, indices?: Range1D, size?: number) {
    const binindex: number[][] = [], missingindex: number[] = [];
    for (let i = this.bins - 1; i >= 0; --i) {
      binindex.push([]);
    }
    if (indices) {
      const it = indices.iter(size);
      arr.forEach((x) => {
        const index = it.next();
        const bin = this.binOf(x);
        if (bin < 0) {
          this._missing++;
          missingindex.push(index);
        } else {
          this._bins[bin]++;
          binindex[bin].push(index);
        }
      });
      //build range and remove duplicates
      this._ranges = binindex.map((d) => Range.list(d.sort().filter((di, i, a) => di !== a[i - 1])));
      this._missingRange = Range.list(missingindex.sort().filter((di, i, a) => di !== a[i - 1]));
    } else {
      arr.forEach((x) => {
        const bin = this.binOf(x);
        if (bin < 0) {
          this._missing++;
        } else {
          this._bins[bin]++;
        }
      });
      this._ranges = null;
      this._missingRange = null;
    }
  }

  forEach(callbackfn: (value: number, index: number) => void, thisArg?: any) {
    return this._bins.forEach(callbackfn, thisArg);
  }
}

export class Histogram extends AHistogram {
  constructor(bins: number, private valueRange: number[], hist?: number[]) {
    super(bins, hist);
  }

  binOf(value: any) {
    if (typeof value === 'number') {
      return this.binOfImpl(<number>value);
    }
    return -1;
  }

  private binOfImpl(value: number) {
    if (isNaN(value)) {
      return -1;
    }
    const n = (value - this.valueRange[0]) / (this.valueRange[1] - this.valueRange[0]);
    let bin = Math.round(n * (this.bins - 1));
    if (bin < 0) {
      bin = 0;
    }
    if (bin >= this.bins) {
      bin = this.bins - 1;
    }
    return isNaN(bin) ? -1 : bin;
  }
  static hist(arr: IIterable<number>, indices: Range1D, size: number, bins: number, range: number[]): IHistogram {
    const r = new Histogram(bins, range);
    r.pushAll(arr, indices, size);
    return r;
  }
  static wrapHist(hist: number[], valueRange: number[]) {
    return new Histogram(hist.length, valueRange, hist);
  }
}

export class CatHistogram extends AHistogram implements ICatHistogram {
  constructor(private values: any[], public readonly categories: string[], public readonly colors: string[]) {
    super(values.length);
  }

  binOf(value: any) {
    return this.values.indexOf(value);
  }
  static categoricalHist<T>(arr: IIterable<T>, indices: Range1D, size: number, categories: T[], labels: string[], colors: string[]): IHistogram {
    const r = new CatHistogram(categories, labels, colors);
    r.pushAll(arr, indices, size);
    return r;
  }
}


export class RangeHistogram implements ICatHistogram {
  constructor(private readonly _range: CompositeRange1D) {
  }

  get categories() {
    return this._range.groups.map((g) => g.name);
  }

  get colors() {
    return this._range.groups.map((g) => g.color);
  }

  get largestFrequency() {
    return Math.max.apply(Math, this._range.groups.map((g) => g.length));
  }

  get largestBin() {
    return this.largestFrequency;
  }

  get count() {
    return this._range.length;
  }

  get validCount() {
    return this.count;
  }

  get bins() {
    return this._range.groups.length;
  }

  binOf(value: any) {
    return this._range.groups.findIndex((g) => g.name === value);
  }

  frequency(bin: number) {
    return this._range.groups[bin].length;
  }

  range(bin: number) {
    return Range.list(this._range.groups[bin]);
  }

  get missing() {
    return 0;
  }

  get missingRange() {
    return Range.none();
  }

  forEach(callbackfn: (value: number, index: number) => void, thisArg?: any) {
    return this._range.groups.forEach((g, i) => callbackfn.call(thisArg, g.length, i));
  }
  static rangeHist(range: CompositeRange1D) {
    return new RangeHistogram(range);
  }
}
