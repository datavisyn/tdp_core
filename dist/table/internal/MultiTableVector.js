import { ArrayUtils } from '../../base/ArrayUtils';
import { BaseUtils } from '../../base/BaseUtils';
import { ParseRangeUtils, Range } from '../../range';
import { AVector } from '../../vector/AVector';
/**
 * @internal
 */
export class MultiTableVector extends AVector {
    constructor(table, f, thisArgument = table, valuetype = null, _idtype = table.idtype) {
        super(null);
        this.table = table;
        this.f = f;
        this.thisArgument = thisArgument;
        this.valuetype = valuetype;
        this._idtype = _idtype;
        this.desc = {
            name: `${table.desc.name}-p`,
            fqname: `${table.desc.fqname}-p`,
            description: f.toString(),
            type: 'vector',
            id: BaseUtils.fixId(`${table.desc.id}-p${f.toString()}`),
            idtype: table.desc.idtype,
            size: table.nrow,
            value: valuetype,
            creator: table.desc.creator,
            ts: Date.now(),
        };
        this.root = this;
    }
    get idtype() {
        return this._idtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    persist() {
        return {
            root: this.table.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype ? this.valuetype : undefined,
            idtype: this.idtype === this.table.idtype ? undefined : this.idtype.name,
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
    size() {
        return this.table.nrow;
    }
    /**
     * return the associated ids of this vector
     */
    names(range) {
        return this.table.rows(range);
    }
    ids(range) {
        return this.table.rowIds(range);
    }
    /**
     * returns a promise for getting one cell
     * @param i
     */
    async at(i) {
        return this.f.call(this.thisArgument, (await this.table.data(Range.list(i)))[0]);
    }
    /**
     * returns a promise for getting the data as two dimensional array
     * @param range
     */
    async data(range) {
        return (await this.table.data(range)).map(this.f, this.thisArgument);
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
//# sourceMappingURL=MultiTableVector.js.map