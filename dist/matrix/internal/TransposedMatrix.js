import { Range, ParseRangeUtils } from '../../range';
import { DataUtils } from '../../data';
import { AMatrix, MatrixView } from '../AMatrix';
import { SliceRowVector } from './SliceRowVector';
/**
 * view on the underlying matrix as transposed version
 * @param base
 * @constructor
 */
export class TransposedMatrix extends AMatrix {
    constructor(base) {
        super(base);
        this.t = base;
    }
    get desc() {
        return this.root.desc;
    }
    persist() {
        return {
            root: this.root.persist(),
            transposed: true,
        };
    }
    get valuetype() {
        return this.root.valuetype;
    }
    get rowtype() {
        return this.root.coltype;
    }
    get coltype() {
        return this.root.rowtype;
    }
    get producttype() {
        return this.root.producttype;
    }
    get idtypes() {
        return [this.rowtype, this.coltype];
    }
    async ids(range = Range.all()) {
        const ids = await this.t.ids(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
        return ids.swap();
    }
    cols(range = Range.all()) {
        return this.t.rows(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    colIds(range = Range.all()) {
        return this.t.rowIds(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    rows(range = Range.all()) {
        return this.t.cols(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    rowIds(range = Range.all()) {
        return this.t.colIds(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    view(range = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(range);
        if (r.isAll) {
            return this;
        }
        return new MatrixView(this.root, r.swap()).t;
    }
    slice(col) {
        return new SliceRowVector(this.root, col);
    }
    size() {
        const s = this.t.dim;
        return [s[1], s[0]]; // swap dimension
    }
    at(i, j) {
        return this.t.at(j, i);
    }
    async data(range = Range.all()) {
        return DataUtils.transpose(await this.t.data(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined));
    }
    hist(bins, range = Range.all(), containedIds = 0) {
        return this.t.hist(bins, range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined, 1 - containedIds);
    }
    stats(range = Range.all()) {
        return this.t.stats(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    statsAdvanced(range = Range.all()) {
        return this.t.statsAdvanced(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined);
    }
    heatmapUrl(range = Range.all(), options = {}) {
        options.transpose = options.transpose !== true;
        return this.t.heatmapUrl(range ? ParseRangeUtils.parseRangeLike(range).swap() : undefined, options);
    }
}
//# sourceMappingURL=TransposedMatrix.js.map