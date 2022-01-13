import { Range, Range1DGroup, ParseRangeUtils } from '../range';
import { CompositeRange1D } from '../range/CompositeRange1D';
import { ArrayUtils } from '../base/ArrayUtils';
import { ASelectAble, IDTypeManager } from '../idtype';
import { Categorical2PartioningUtils, ValueTypeUtils, } from '../data';
import { Histogram, CatHistogram } from '../data/histogram';
import { Statistics, AdvancedStatistics } from '../base/statistics';
import { ProjectedAtom } from './ProjectedAtom';
/**
 * base class for different Vector implementations, views, transposed,...
 * @internal
 */
export class AVector extends ASelectAble {
    constructor(root) {
        super();
        this.root = root;
    }
    get dim() {
        return [this.length];
    }
    get length() {
        return this.size();
    }
    view(range = Range.all()) {
        // Disabled the rule, because the classes below reference each other in a way that it is impossible to find a successful order.
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new VectorView(this.root, ParseRangeUtils.parseRangeLike(range));
    }
    async idView(idRange = Range.all()) {
        const ids = await this.ids();
        return this.view(ids.indexOf(ParseRangeUtils.parseRangeLike(idRange)));
    }
    async stats(range = Range.all()) {
        if (this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_INT && this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_REAL) {
            return Promise.reject(`invalid value type: ${this.root.valuetype.type}`);
        }
        return Statistics.computeStats(await this.data(range));
    }
    async statsAdvanced(range = Range.all()) {
        if (this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_INT && this.root.valuetype.type !== ValueTypeUtils.VALUE_TYPE_REAL) {
            return Promise.reject(`invalid value type: ${this.root.valuetype.type}`);
        }
        return AdvancedStatistics.computeAdvancedStats(await this.data(range));
    }
    get indices() {
        return Range.range(0, this.length);
    }
    /**
     * return the range of this vector as a grouped range, depending on the type this might be a single group or multiple ones
     */
    async groups() {
        const v = this.root.valuetype;
        if (v.type === ValueTypeUtils.VALUE_TYPE_CATEGORICAL) {
            const vc = v;
            const d = await this.data();
            const options = {
                name: this.root.desc.id,
            };
            if (typeof vc.categories[0] !== 'string') {
                const vcc = vc.categories;
                if (vcc[0].color) {
                    options.colors = vcc.map((a) => a.color);
                }
                if (vcc[0].label) {
                    options.labels = vcc.map((a) => a.label);
                }
            }
            return Categorical2PartioningUtils.categorical2partitioning(d, vc.categories.map((a) => (typeof a === 'string' ? a : a.name)), options);
        }
        return Promise.resolve(CompositeRange1D.composite(this.root.desc.id, [Range1DGroup.asUngrouped(this.indices.dim(0))]));
    }
    async hist(bins, range = Range.all()) {
        const v = this.root.valuetype;
        const d = await this.data(range);
        switch (v.type) {
            case ValueTypeUtils.VALUE_TYPE_CATEGORICAL:
                // eslint-disable-next-line no-case-declarations
                const vc = v;
                return CatHistogram.categoricalHist(d, this.indices.dim(0), d.length, vc.categories.map((a) => (typeof a === 'string' ? a : a.name)), vc.categories.map((a) => (typeof a === 'string' ? a : a.label || a.name)), vc.categories.map((a) => (typeof a === 'string' ? 'gray' : a.color || 'gray')));
            case ValueTypeUtils.VALUE_TYPE_REAL:
            case ValueTypeUtils.VALUE_TYPE_INT:
                // eslint-disable-next-line no-case-declarations
                const vn = v;
                return Histogram.hist(d, this.indices.dim(0), d.length, bins || Math.round(Math.sqrt(this.length)), vn.range);
            default:
                return null; // cant create hist for unique objects or other ones
        }
    }
    async every(callbackfn, thisArg) {
        return (await this.data()).every(callbackfn, thisArg);
    }
    async some(callbackfn, thisArg) {
        return (await this.data()).some(callbackfn, thisArg);
    }
    async forEach(callbackfn, thisArg) {
        (await this.data()).forEach(callbackfn, thisArg);
    }
    async reduce(callbackfn, initialValue, thisArg) {
        function helper() {
            // eslint-disable-next-line prefer-rest-params
            return callbackfn.apply(thisArg, Array.from(arguments));
        }
        return (await this.data()).reduce(helper, initialValue);
    }
    async reduceRight(callbackfn, initialValue, thisArg) {
        function helper() {
            // eslint-disable-next-line prefer-rest-params
            return callbackfn.apply(thisArg, Array.from(arguments));
        }
        return (await this.data()).reduceRight(helper, initialValue);
    }
    reduceAtom(f, thisArgument, valuetype, idtype) {
        const r = this;
        return new ProjectedAtom(r, f, thisArgument, valuetype, idtype);
    }
    restore(persisted) {
        let r = this;
        if (persisted && persisted.f) {
            return this.reduceAtom(
            // eslint-disable-next-line no-eval
            eval(persisted.f), this, persisted.valuetype, persisted.idtype ? IDTypeManager.getInstance().resolveIdType(persisted.idtype) : undefined);
        }
        if (persisted && persisted.range) {
            // some view onto it
            r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        return r;
    }
}
/**
 * view on the vector restricted by a range
 * @internal
 */
export class VectorView extends AVector {
    /**
     * @param root underlying matrix
     * @param range range selection
     */
    constructor(root, range) {
        super(root);
        this.range = range;
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
    size() {
        return this.range.size(this.root.dim)[0];
    }
    at(i) {
        const inverted = this.range.invert([i], this.root.dim);
        return this.root.at(inverted[0]);
    }
    data(range = Range.all()) {
        return this.root.data(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    names(range = Range.all()) {
        return this.root.names(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    ids(range = Range.all()) {
        return this.root.ids(this.range.preMultiply(ParseRangeUtils.parseRangeLike(range), this.root.dim));
    }
    view(range = Range.all()) {
        const r = ParseRangeUtils.parseRangeLike(range);
        if (r.isAll) {
            return this;
        }
        return new VectorView(this.root, this.range.preMultiply(r, this.dim));
    }
    get valuetype() {
        return this.root.valuetype;
    }
    get idtype() {
        return this.root.idtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    /* get indices() {
     return this.range;
     } */
    async sort(compareFn, thisArg) {
        const d = await this.data();
        const indices = ArrayUtils.argSort(d, compareFn, thisArg);
        return this.view(Range.list(indices));
    }
    async filter(callbackfn, thisArg) {
        const d = await this.data();
        const indices = ArrayUtils.argFilter(d, callbackfn, thisArg);
        return this.view(Range.list(indices));
    }
}
//# sourceMappingURL=AVector.js.map