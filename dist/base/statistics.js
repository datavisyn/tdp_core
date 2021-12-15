export class Statistics {
    constructor() {
        this.min = NaN;
        this.max = NaN;
        this.sum = 0;
        this.mean = 0;
        this._var = 0;
        this.n = 0;
        this.nans = 0;
        this.moment2 = NaN;
        this.moment3 = NaN;
        this.moment4 = NaN;
    }
    get var() {
        return this.n > 1 ? this._var / (this.n - 1) : 0;
    }
    /** Returns the standard deviation */
    get sd() {
        return Math.sqrt(this.var);
    }
    get kurtosis() {
        if (this.n === 0) {
            return 0;
        }
        return (this.n * this.moment4) / (this.moment2 * this.moment2) - 3;
    }
    get skewness() {
        if (this.n === 0) {
            return 0;
        }
        return Math.sqrt(this.n) * this.moment3 / (Math.pow(this.moment2, 3. / 2.));
    }
    push(x) {
        if (typeof x !== 'number') {
            x = Number.NaN;
        }
        if (isNaN(x)) {
            this.nans++;
            return;
        }
        this.n++;
        this.sum += x;
        if (x < this.min || isNaN(this.min)) {
            this.min = x;
        }
        if (this.max < x || isNaN(this.max)) {
            this.max = x;
        }
        // http://www.johndcook.com/standard_deviation.html
        // See Knuth TAOCP vol 2, 3rd edition, page 232
        // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Higher-order_statistics
        if (this.n === 1) {
            this.mean = x;
            this._var = 0;
            this.moment2 = this.moment3 = this.moment4 = 0;
        }
        else {
            const meanMinus1 = this.mean;
            this.mean = meanMinus1 + (x - meanMinus1) / this.n;
            this._var = this._var + (x - meanMinus1) * (x - this.mean);
            const delta = x - meanMinus1;
            const deltaN = delta / this.n;
            const deltaNSquare = deltaN * deltaN;
            const term1 = delta * deltaN * (this.n - 1);
            this.moment4 += term1 * deltaNSquare * (this.n * this.n - 3 * this.n + 3) + 6 * deltaNSquare * this.moment2 - 4 * deltaN * this.moment3;
            this.moment3 += term1 * deltaN * (this.n - 2) - 3 * deltaN * this.moment2;
            this.moment2 += term1;
        }
    }
    static computeStats(...arr) {
        const r = new Statistics();
        arr.forEach((a) => a.forEach(r.push, r));
        return r;
    }
}
export class AdvancedStatistics extends Statistics {
    constructor(median, q1, q3) {
        super();
        this.median = median;
        this.q1 = q1;
        this.q3 = q3;
    }
    static computeAdvancedStats(arr) {
        arr = arr.slice().sort((a, b) => a - b);
        const r = new AdvancedStatistics(quantile(arr, 0.5), quantile(arr, 0.25), quantile(arr, 0.75));
        arr.forEach((a) => r.push(a));
        return r;
    }
}
function quantile(arr, percentile) {
    const n = arr.length;
    if (n === 0) {
        return NaN;
    }
    if (n < 2 || percentile <= 0) {
        return arr[0];
    }
    if (percentile >= 1) {
        return arr[n - 1];
    }
    const target = percentile * (n - 1);
    const targetIndex = Math.floor(target);
    const a = arr[targetIndex], b = arr[targetIndex + 1];
    return a + (b - a) * (target - targetIndex);
}
//# sourceMappingURL=statistics.js.map