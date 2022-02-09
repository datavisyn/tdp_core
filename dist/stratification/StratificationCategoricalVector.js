import { ArrayUtils } from '../base/ArrayUtils';
import { Range, ParseRangeUtils } from '../range';
import { ValueTypeUtils } from '../data';
import { AVector } from '../vector/AVector';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class StratificationCategoricalVector extends AVector {
    constructor(strat, range) {
        super(null);
        this.strat = strat;
        this.range = range;
        this._cache = null;
        this.root = this;
        this.valuetype = {
            type: ValueTypeUtils.VALUE_TYPE_CATEGORICAL,
            categories: range.groups.map((g) => ({ name: g.name, label: g.name, color: g.color })),
        };
        const d = strat.desc;
        this.desc = {
            name: d.name,
            fqname: d.fqname,
            description: d.description,
            id: `${d.id}-v`,
            type: 'vector',
            size: d.size,
            idtype: d.idtype,
            value: this.valuetype,
            creator: d.creator,
            ts: d.ts,
        };
    }
    get idtype() {
        return this.strat.idtype;
    }
    get idtypes() {
        return [this.idtype];
    }
    persist() {
        return {
            root: this.strat.persist(),
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
    load() {
        if (!this._cache) {
            const r = [];
            this.range.groups.forEach((g) => {
                g.forEach(() => r.push(g.name));
            });
            this._cache = r;
        }
        return this._cache;
    }
    /**
     * access at a specific position
     * @param i
     * @returns {*}
     */
    at(i) {
        return Promise.resolve(this.load()[i]);
    }
    data(range = Range.all()) {
        const data = this.load();
        return Promise.resolve(ParseRangeUtils.parseRangeLike(range).filter(data, this.dim));
    }
    names(range = Range.all()) {
        return this.strat.names(range);
    }
    ids(range = Range.all()) {
        return this.strat.ids(range);
    }
    size() {
        return this.strat.size();
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
//# sourceMappingURL=StratificationCategoricalVector.js.map