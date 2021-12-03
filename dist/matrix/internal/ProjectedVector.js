import { ArrayUtils } from '../../base/ArrayUtils';
import { Range, ParseRangeUtils } from '../../range';
import { AVector } from '../../vector/AVector';
/**
 * a simple projection of a matrix columns to a vector
 */
export class ProjectedVector extends AVector {
    constructor(m, f, thisArgument = m, valuetype = m.valuetype, _idtype = m.rowtype) {
        super(null);
        this.m = m;
        this.f = f;
        this.thisArgument = thisArgument;
        this.valuetype = valuetype;
        this._idtype = _idtype;
        this.desc = {
            name: m.desc.name + '-p',
            fqname: m.desc.fqname + '-p',
            type: 'vector',
            id: m.desc.id + '-p',
            size: this.dim[0],
            idtype: m.rowtype,
            value: this.valuetype,
            description: m.desc.description,
            creator: m.desc.creator,
            ts: m.desc.ts
        };
        this.root = this;
    }
    persist() {
        return {
            root: this.m.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype === this.m.valuetype ? undefined : this.valuetype,
            idtype: this.idtype === this.m.rowtype ? undefined : this.idtype.name
        };
    }
    restore(persisted) {
        let r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        return r;
    }
    get idtype() {
        return this._idtype;
    }
    get idtypes() {
        return [this._idtype];
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
    async at(i) {
        const d = await this.m.data(Range.list(i));
        return this.f.call(this.thisArgument, d[0]);
    }
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    async data(range) {
        return (await this.m.data(range)).map(this.f, this.thisArgument);
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
//# sourceMappingURL=ProjectedVector.js.map