import { ArrayUtils } from '../../base/ArrayUtils';
import { Range, ParseRangeUtils } from '../../range';
import { AVector } from '../../vector/AVector';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class TableVector extends AVector {
    constructor(table, index, desc) {
        super(null);
        this.table = table;
        this.index = index;
        this.column = desc.column;
        this.root = this;
        this.desc = {
            type: 'vector',
            id: `${table.desc.id}_${desc.name}`,
            name: desc.name,
            description: desc.description || '',
            fqname: `${table.desc.fqname}/${desc.name}`,
            idtype: table.idtype.id,
            size: table.nrow,
            value: desc.value,
            creator: table.desc.creator,
            ts: table.desc.ts,
        };
    }
    get valuetype() {
        return this.desc.value;
    }
    get idtype() {
        return this.table.idtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    persist() {
        return {
            root: this.table.persist(),
            col: this.index,
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
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    at(i) {
        return this.table.at(i, this.index);
    }
    data(range = Range.all()) {
        return this.table.colData(this.column, range);
    }
    names(range = Range.all()) {
        return this.table.rows(range);
    }
    ids(range = Range.all()) {
        return this.table.rowIds(range);
    }
    size() {
        return this.table.nrow;
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
//# sourceMappingURL=TableVector.js.map