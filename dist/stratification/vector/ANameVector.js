import { AVector } from '../../vector/AVector';
import { ParseRangeUtils, Range } from '../../range';
import { ArrayUtils } from '../../base/ArrayUtils';
export class ANameVector extends AVector {
    constructor(base) {
        super(null);
        this.base = base;
        this.desc = {
            type: 'vector',
            name: base.desc.name,
            fqname: base.desc.fqname,
            description: base.desc.description,
            id: base.desc.id + '_names',
            value: {
                type: 'string'
            },
            idtype: this.idtype.id,
            size: this.length,
            ts: base.desc.ts,
            creator: base.desc.creator,
            group: base.desc.group,
            permissions: base.desc.permissions
        };
    }
    get valuetype() {
        return this.desc.value;
    }
    // TODO This method should be abstract. However, it results in a compile error with Typescript v2.7.2:
    // `TS2715: Abstract property 'idtype' in class 'ANameVector' cannot be accessed in the constructor.`
    /*abstract*/ get idtype() {
        return null;
    }
    get idtypes() {
        return [this.idtype];
    }
    persist() {
        return {
            root: this.base.persist(),
            names: true
        };
    }
    restore(persisted) {
        let r = this;
        if (persisted && persisted.range) { //some view onto it
            r = r.view(ParseRangeUtils.parseRangeLike(persisted.range));
        }
        return r;
    }
    at(i) {
        return this.data(Range.list(i)).then((names) => names[0]);
    }
    data(range = Range.all()) {
        return this.names(range);
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
//# sourceMappingURL=ANameVector.js.map