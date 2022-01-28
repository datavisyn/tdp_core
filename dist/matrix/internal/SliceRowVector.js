import { ArrayUtils } from '../../base/ArrayUtils';
import { Range, ParseRangeUtils, Range1D } from '../../range';
import { AVector } from '../../vector/AVector';
/**
 * a simple projection of a matrix columns to a vector
 */
export class SliceRowVector extends AVector {
    constructor(m, row) {
        super(null);
        this.m = m;
        this.row = row;
        this.rowRange = Range1D.from([this.row]);
        this.desc = {
            name: `${m.desc.name}-r${row}`,
            fqname: `${m.desc.fqname}-r${row}`,
            id: `${m.desc.id}-r${row}`,
            type: 'vector',
            idtype: m.coltype,
            size: m.ncol,
            value: m.valuetype,
            description: m.desc.description,
            creator: m.desc.creator,
            ts: m.desc.ts,
        };
        this.root = this;
    }
    persist() {
        return {
            root: this.m.persist(),
            row: this.row,
        };
    }
    restore(persisted) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let r = this;
        if (persisted && persisted.range) {
            // some view onto it
            r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        return r;
    }
    get valuetype() {
        return this.m.valuetype;
    }
    get idtype() {
        return this.m.coltype;
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return this.m.ncol;
    }
    /**
     * return the associated ids of this vector
     */
    names(range) {
        return this.m.cols(range);
    }
    ids(range) {
        return this.m.colIds(range);
    }
    /**
     * returns a promise for getting one cell
     * @param i
     */
    at(i) {
        return this.m.at(this.row, i);
    }
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    async data(range = Range.all()) {
        const rr = ParseRangeUtils.parseRangeLike(range);
        const r = Range.list(this.rowRange, rr.dim(0));
        const d = await this.m.data(r);
        return d[0];
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
}
//# sourceMappingURL=SliceRowVector.js.map