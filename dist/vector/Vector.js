import { BaseUtils } from '../base/BaseUtils';
import { ArrayUtils } from '../base/ArrayUtils';
import { Range, ParseRangeUtils } from '../range';
import { IDTypeManager, LocalIDAssigner } from '../idtype';
import { ValueTypeUtils } from '../data';
import { VectorUtils } from './VectorUtils';
import { AVector } from './AVector';
import { VectorLoaderUtils } from './loader';
/**
 * Base vector implementation holding the data.
 * @internal
 */
export class Vector extends AVector {
    constructor(desc, loader) {
        super(null);
        this.desc = desc;
        this.loader = loader;
        this.root = this;
    }
    get valuetype() {
        return this.desc.value;
    }
    get idtype() {
        return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
    }
    /**
     * loads all the underlying data in json format
     * TODO: load just needed data and not everything given by the requested range
     * @returns {*}
     */
    load() {
        return this.loader(this.desc);
    }
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    async at(i) {
        return (await this.load()).data[i];
    }
    async data(range = Range.all()) {
        const data = await this.load();
        const d = ParseRangeUtils.parseRangeLike(range).filter(data.data, this.dim);
        if ((this.valuetype.type === ValueTypeUtils.VALUE_TYPE_REAL || this.valuetype.type === ValueTypeUtils.VALUE_TYPE_INT)) {
            return ValueTypeUtils.mask(d, this.valuetype);
        }
        return d;
    }
    async names(range = Range.all()) {
        const data = await this.load();
        return ParseRangeUtils.parseRangeLike(range).filter(data.rows, this.dim);
    }
    async ids(range = Range.all()) {
        const data = await this.load();
        return data.rowIds.preMultiply(ParseRangeUtils.parseRangeLike(range), this.dim);
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return this.desc.size;
    }
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
    persist() {
        return this.desc.id;
    }
    /**
     * module entry point for creating a datatype
     * @internal
     * @param desc
     * @returns {IVector}
     */
    static create(desc) {
        if (typeof (desc.loader) === 'function') {
            return new Vector(desc, desc.loader);
        }
        return new Vector(desc, VectorLoaderUtils.viaAPILoader());
    }
    static wrap(desc, rows, rowIds, data) {
        return new Vector(desc, VectorLoaderUtils.viaDataLoader(rows, rowIds, data));
    }
    static asVector(rows, data, options = {}) {
        const desc = BaseUtils.mixin(VectorUtils.createDefaultVectorDesc(), {
            size: data.length,
            value: ValueTypeUtils.guessValueTypeDesc(data)
        }, options);
        const rowAssigner = options.rowassigner || LocalIDAssigner.create();
        return new Vector(desc, VectorLoaderUtils.viaDataLoader(rows, rowAssigner(rows), data));
    }
}
//# sourceMappingURL=Vector.js.map