import { ArrayUtils } from '../../base/ArrayUtils';
import { Range, ParseRangeUtils, Range1D } from '../../range';
import { AVector } from '../../vector/AVector';
/**
 * a simple projection of a matrix columns to a vector
 */
export class SliceColVector extends AVector {
    constructor(m, col) {
        super(null);
        this.m = m;
        this.col = col;
        this.colRange = Range1D.from([this.col]);
        this.desc = {
            name: `${m.desc.name}-c${col}`,
            fqname: `${m.desc.fqname}-c${col}`,
            id: `${m.desc.id}-c${col}`,
            type: 'vector',
            idtype: m.rowtype,
            size: m.nrow,
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
            col: this.col,
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
        return this.m.rowtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return this.m.nrow;
    }
    /**
     * return the associated ids of this vector
     */
    names(range) {
        return this.m.rows(range);
    }
    ids(range) {
        return this.m.rowIds(range);
    }
    /**
     * returns a promise for getting one cell
     * @param i
     */
    at(i) {
        return this.m.at(i, this.col);
    }
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    async data(range = Range.all()) {
        const rr = ParseRangeUtils.parseRangeLike(range);
        const r = Range.list(rr.dim(0), this.colRange);
        const d = await this.m.data(r);
        if (d.length === 0) {
            return [];
        }
        if (Array.isArray(d[0])) {
            return d.map((di) => di[0]);
        }
        return d;
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
//# sourceMappingURL=SliceColVector.js.map