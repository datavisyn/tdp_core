import { Range } from '../range/Range';
export class AHistogram {
    constructor(bins, hist) {
        this._missing = 0;
        this._missingRange = Range.none();
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
    binOf(value) {
        return -1;
    }
    frequency(bin) {
        return this._bins[bin];
    }
    range(bin) {
        return this._ranges ? this._ranges[bin] : Range.none();
    }
    get missing() {
        return this._missing;
    }
    get missingRange() {
        return this._missingRange;
    }
    pushAll(arr, indices, size) {
        const binindex = [];
        const missingindex = [];
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
                }
                else {
                    this._bins[bin]++;
                    binindex[bin].push(index);
                }
            });
            // build range and remove duplicates
            this._ranges = binindex.map((d) => Range.list(d.sort().filter((di, i, a) => di !== a[i - 1])));
            this._missingRange = Range.list(missingindex.sort().filter((di, i, a) => di !== a[i - 1]));
        }
        else {
            arr.forEach((x) => {
                const bin = this.binOf(x);
                if (bin < 0) {
                    this._missing++;
                }
                else {
                    this._bins[bin]++;
                }
            });
            this._ranges = null;
            this._missingRange = null;
        }
    }
    forEach(callbackfn, thisArg) {
        return this._bins.forEach(callbackfn, thisArg);
    }
}
export class Histogram extends AHistogram {
    constructor(bins, valueRange, hist) {
        super(bins, hist);
        this.valueRange = valueRange;
    }
    binOf(value) {
        if (typeof value === 'number') {
            return this.binOfImpl(value);
        }
        return -1;
    }
    binOfImpl(value) {
        if (Number.isNaN(value)) {
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
        return Number.isNaN(bin) ? -1 : bin;
    }
    static hist(arr, indices, size, bins, range) {
        const r = new Histogram(bins, range);
        r.pushAll(arr, indices, size);
        return r;
    }
    static wrapHist(hist, valueRange) {
        return new Histogram(hist.length, valueRange, hist);
    }
}
export class CatHistogram extends AHistogram {
    constructor(values, categories, colors) {
        super(values.length);
        this.values = values;
        this.categories = categories;
        this.colors = colors;
    }
    binOf(value) {
        return this.values.indexOf(value);
    }
    static categoricalHist(arr, indices, size, categories, labels, colors) {
        const r = new CatHistogram(categories, labels, colors);
        r.pushAll(arr, indices, size);
        return r;
    }
}
export class RangeHistogram {
    constructor(_range) {
        this._range = _range;
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
    binOf(value) {
        return this._range.groups.findIndex((g) => g.name === value);
    }
    frequency(bin) {
        return this._range.groups[bin].length;
    }
    range(bin) {
        return Range.list(this._range.groups[bin]);
    }
    get missing() {
        return 0;
    }
    get missingRange() {
        return Range.none();
    }
    forEach(callbackfn, thisArg) {
        return this._range.groups.forEach((g, i) => callbackfn.call(thisArg, g.length, i));
    }
    static rangeHist(range) {
        return new RangeHistogram(range);
    }
}
//# sourceMappingURL=histogram.js.map