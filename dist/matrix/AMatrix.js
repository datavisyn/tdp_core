import { Range, ParseRangeUtils } from '../range';
import { IDTypeManager } from '../idtype';
import { AProductSelectAble } from '../idtype/AProductSelectAble';
import { ValueTypeUtils } from '../data';
import { CatHistogram, Histogram } from '../data/histogram';
import { Statistics, AdvancedStatistics } from '../base/statistics';
import { SliceColVector } from './internal/SliceColVector';
import { ProjectedVector } from './internal/ProjectedVector';
function flatten(arr, indices, select = 0) {
    let r = [];
    const dim = [arr.length, arr[0].length];
    if (select === 0) {
        r = r.concat.apply(r, arr);
    }
    else {
        // stupid slicing
        for (let i = 0; i < dim[1]; ++i) {
            arr.forEach((ai) => {
                r.push(ai[i]);
            });
        }
    }
    return {
        data: r,
        indices: indices.dim(select).repeat(dim[1 - select]),
    };
}
/**
 * base class for different Matrix implementations, views, transposed,...
 */
export class AMatrix extends AProductSelectAble {
    constructor(root) {
        super();
        this.root = root;
    }
    get dim() {
        return this.size();
    }
    get length() {
        return this.nrow * this.ncol;
    }
    get nrow() {
        return this.dim[0];
    }
    get ncol() {
        return this.dim[1];
    }
    get indices() {
        return Range.range([0, this.nrow], [0, this.ncol]);
    }
    view(range = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(range);
        if (r.isAll) {
            return this.root;
        }
        // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new MatrixView(this.root, r);
    }
    slice(col) {
        return new SliceColVector(this.root, col);
    }
    async stats(range = Range.all()) {
        const v = this.root.valuetype;
        if (v.type === ValueTypeUtils.VALUE_TYPE_INT || v.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            return Statistics.computeStats(...await this.data(range));
        }
        return Promise.reject(`invalid value type: ${v.type}`);
    }
    async statsAdvanced(range = Range.all()) {
        const v = this.root.valuetype;
        if (v.type === ValueTypeUtils.VALUE_TYPE_INT || v.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            return AdvancedStatistics.computeAdvancedStats([].concat(...await this.data(range)));
        }
        return Promise.reject(`invalid value type: ${v.type}`);
    }
    async hist(bins, range = Range.all(), containedIds = 0) {
        const v = this.root.valuetype;
        const d = await this.data(range);
        const flat = flatten(d, this.indices, containedIds);
        switch (v.type) {
            case ValueTypeUtils.VALUE_TYPE_CATEGORICAL:
                const vc = v;
                return CatHistogram.categoricalHist(flat.data, flat.indices, flat.data.length, vc.categories.map((d) => (typeof d === 'string' ? d : d.name)), vc.categories.map((d) => (typeof d === 'string' ? d : d.label || d.name)), vc.categories.map((d) => (typeof d === 'string' ? 'gray' : d.color || 'gray')));
            case ValueTypeUtils.VALUE_TYPE_INT:
            case ValueTypeUtils.VALUE_TYPE_REAL:
                const vn = v;
                return Histogram.hist(flat.data, flat.indices, flat.data.length, bins || Math.round(Math.sqrt(this.length)), vn.range);
            default:
                return Promise.reject(`invalid value type: ${v.type}`); // cant create hist for unique objects or other ones
        }
    }
    async idView(idRange = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(idRange);
        if (r.isAll) {
            return Promise.resolve(this.root);
        }
        const ids = await this.ids();
        return this.view(ids.indexOf(r));
    }
    reduce(f, thisArgument, valuetype, idtype) {
        return new ProjectedVector(this.root, f, thisArgument, valuetype, idtype);
    }
    restore(persisted) {
        if (persisted && persisted.f) {
            return this.reduce(eval(persisted.f), this, persisted.valuetype, persisted.idtype ? IDTypeManager.getInstance().resolveIdType(persisted.idtype) : undefined);
        }
        if (persisted && persisted.range) {
            // some view onto it
            return this.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        if (persisted && persisted.transposed) {
            return this.t;
        }
        if (persisted && persisted.col) {
            return this.slice(+persisted.col);
        }
        if (persisted && persisted.row) {
            return this.t.slice(+persisted.row);
        }
        return this;
    }
}
AMatrix.IDTYPE_ROW = 0;
AMatrix.IDTYPE_COLUMN = 1;
AMatrix.IDTYPE_CELL = 2;
AMatrix.DIM_ROW = 0;
AMatrix.DIM_COL = 1;
// circular dependency thus not extractable
/**
 * view on the matrix restricted by a range
 * @param root underlying matrix
 * @param range range selection
 * @param t optional its transposed version
 * @constructor
 */
export class MatrixView extends AMatrix {
    constructor(root, range, t = null) {
        super(root);
        this.range = range;
        this.t = t;
        this.range = range;
        // ensure that there are two dimensions
        range.dim(0);
        range.dim(1);
        if (!t) {
            this.t = new MatrixView(root.t, range.swap(), this);
        }
    }
    get desc() {
        return this.root.desc;
    }
    persist() {
        return {
            root: this.root.persist(),
            range: this.range.toString(),
        };
    }
    ids(range = Range.all()) {
        return this.root.ids(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    cols(range = Range.all()) {
        return this.root.cols(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    colIds(range = Range.all()) {
        return this.root.colIds(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    rows(range = Range.all()) {
        return this.root.rows(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    rowIds(range = Range.all()) {
        return this.root.rowIds(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    size() {
        return this.range.size(this.root.dim);
    }
    at(i, j) {
        const inverted = this.range.invert([i, j], this.root.dim);
        return this.root.at(inverted[0], inverted[1]);
    }
    data(range = Range.all()) {
        return this.root.data(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    hist(bins, range = Range.all(), containedIds = 0) {
        return this.root.hist(bins, this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim), containedIds);
    }
    stats(range = Range.all()) {
        return this.root.stats(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    statsAdvanced(range = Range.all()) {
        return this.root.statsAdvanced(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    heatmapUrl(range = Range.all(), options = {}) {
        return this.root.heatmapUrl(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim), options);
    }
    view(range = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(range);
        if (r.isAll) {
            return this;
        }
        return new MatrixView(this.root, this.range.preMultiply(r, this.dim));
    }
    get valuetype() {
        return this.root.valuetype;
    }
    get rowtype() {
        return this.root.rowtype;
    }
    get coltype() {
        return this.root.coltype;
    }
    get producttype() {
        return this.root.producttype;
    }
    get idtypes() {
        return this.root.idtypes;
    }
}
//# sourceMappingURL=AMatrix.js.map