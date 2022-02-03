import { Range } from '../../range';
import { ADataType } from '../../data';
import { RangeHistogram } from '../../data/histogram';
import { StratificationGroup } from '../StratificationGroup';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class StratificationVector extends ADataType {
    constructor(v, r) {
        super({
            id: `${v.desc.id}-s`,
            name: v.desc.name,
            description: v.desc.description,
            creator: v.desc.creator,
            ts: v.desc.ts,
            fqname: v.desc.fqname,
            type: 'stratification',
            idtype: v.idtype.id,
            size: v.length,
            ngroups: r.groups.length,
            groups: r.groups.map((ri) => ({ name: ri.name, color: ri.color, size: ri.length })),
        });
        this.v = v;
        this.r = r;
    }
    get idtype() {
        return this.v.idtype;
    }
    get groups() {
        return this.desc.groups;
    }
    group(group) {
        return new StratificationGroup(this, group, this.groups[group]);
    }
    async hist(bins, range = Range.all()) {
        // FIXME unused parameter
        return RangeHistogram.rangeHist(await this.range());
    }
    vector() {
        return this.asVector();
    }
    asVector() {
        return Promise.resolve(this.v);
    }
    origin() {
        return this.asVector();
    }
    range() {
        return Promise.resolve(this.r);
    }
    async idRange() {
        const ids = await this.ids();
        return ids.dim(0).preMultiply(this.r, this.dim[0]);
    }
    names(range = Range.all()) {
        return this.v.names(range);
    }
    ids(range = Range.all()) {
        return this.v.ids(range);
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return this.desc.size;
    }
    get length() {
        return this.size();
    }
    get ngroups() {
        return this.groups.length;
    }
    get dim() {
        return [this.size()];
    }
    persist() {
        return {
            root: this.v.persist(),
            asstrat: true,
        };
    }
}
//# sourceMappingURL=StratificationVector.js.map