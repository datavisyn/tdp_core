import { BaseUtils } from '../base/BaseUtils';
import { Range, ParseRangeUtils } from '../range';
import { IDTypeManager, LocalIDAssigner } from '../idtype';
import { ADataType, ValueTypeUtils } from '../data';
import { DataCache } from '../data/DataCache';
import { RangeHistogram } from '../data/histogram';
import { StratificationGroup } from './StratificationGroup';
import { StratificationUtils } from './StratificationUtils';
import { StratificationLoaderUtils } from './loader';
import { StratificationCategoricalVector } from './StratificationCategoricalVector';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class Stratification extends ADataType {
    constructor(desc, loader) {
        super(desc);
        this.loader = loader;
    }
    get idtype() {
        return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
    }
    get groups() {
        return this.desc.groups;
    }
    group(group) {
        return new StratificationGroup(this, group, this.groups[group]);
    }
    async hist(bins, range) {
        // TODO
        return RangeHistogram.rangeHist(await this.range());
    }
    vector() {
        return this.asVector();
    }
    asVector() {
        if (!this._v) {
            this._v = this.loader(this.desc).then((data) => new StratificationCategoricalVector(this, data.range));
        }
        return this._v;
    }
    origin() {
        if ('origin' in this.desc) {
            return DataCache.getInstance().getFirstByFQName(this.desc.origin);
        }
        return Promise.reject('no origin specified');
    }
    async range() {
        return (await this.loader(this.desc)).range;
    }
    async idRange() {
        const data = await this.loader(this.desc);
        const ids = data.rowIds.dim(0);
        const { range } = data;
        return ids.preMultiply(range, this.dim[0]);
    }
    async names(range = Range.all()) {
        return ParseRangeUtils.parseRangeLike(range).filter((await this.loader(this.desc)).rows, this.dim);
    }
    async ids(range = Range.all()) {
        return (await this.loader(this.desc)).rowIds.preMultiply(ParseRangeUtils.parseRangeLike(range), this.dim);
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return this.desc.size;
    }
    get length() {
        return this.dim[0];
    }
    get ngroups() {
        return this.desc.ngroups;
    }
    get dim() {
        return [this.size()];
    }
    persist() {
        return this.desc.id;
    }
    static guessColor(stratification, group) {
        switch (group.toLowerCase()) {
            case 'male':
                return 'blue';
            case 'female':
                return 'red';
            case 'deceased':
                return '#e41a1b';
            case 'living':
                return '#377eb8';
        }
        return 'gray';
    }
    /**
     * module entry point for creating a datatype
     * @param desc
     * @returns {IVector}
     */
    static create(desc) {
        return new Stratification(desc, StratificationLoaderUtils.viaAPILoader());
    }
    static wrap(desc, rows, rowIds, range) {
        return new Stratification(desc, StratificationLoaderUtils.viaDataLoader(rows, rowIds, range));
    }
    static asStratification(rows, range, options = {}) {
        const desc = BaseUtils.mixin(StratificationUtils.createDefaultStratificationDesc(), {
            size: 0,
            groups: range.groups.map((r) => ({ name: r.name, color: r.color, size: r.length })),
            ngroups: range.groups.length,
        }, options);
        const rowAssigner = options.rowassigner || LocalIDAssigner.create();
        return new Stratification(desc, StratificationLoaderUtils.viaDataLoader(rows, rowAssigner(rows), range));
    }
    static wrapCategoricalVector(v) {
        if (v.valuetype.type !== ValueTypeUtils.VALUE_TYPE_CATEGORICAL) {
            throw new Error(`invalid vector value type: ${v.valuetype.type}`);
        }
        const toGroup = (g) => {
            if (typeof g === 'string') {
                return { name: g, color: 'gray', size: NaN };
            }
            const cat = g;
            return { name: cat.name, color: cat.color || 'gray', size: NaN };
        };
        const cats = v.desc.value.categories.map(toGroup);
        const desc = {
            id: `${v.desc.id}-s`,
            type: 'stratification',
            name: `${v.desc.name}-s`,
            fqname: `${v.desc.fqname}-s`,
            description: v.desc.description,
            idtype: v.idtype.id,
            ngroups: cats.length,
            groups: cats,
            size: v.length,
            creator: v.desc.creator,
            ts: v.desc.ts,
        };
        function loader() {
            return Promise.all([v.groups(), v.ids(), v.names()]).then((args) => {
                const range = args[0];
                range.groups.forEach((g, i) => (cats[i].size = g.length));
                return {
                    range: args[0],
                    rowIds: args[1],
                    rows: args[2],
                };
            });
        }
        return new Stratification(desc, loader);
    }
}
//# sourceMappingURL=Stratification.js.map