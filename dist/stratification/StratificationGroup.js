import { Range, CompositeRange1D, ParseRangeUtils } from '../range';
import { ASelectAble } from '../idtype';
import { RangeHistogram } from '../data/histogram';
/**
 * root matrix implementation holding the data
 * @internal
 */
export class StratificationGroup extends ASelectAble {
    constructor(root, groupIndex, groupDesc) {
        super();
        this.root = root;
        this.groupIndex = groupIndex;
        this.groupDesc = groupDesc;
    }
    get desc() {
        return this.root.desc;
    }
    get groups() {
        return [this.groupDesc];
    }
    get ngroups() {
        return 1;
    }
    group(groupIndex) {
        if (groupIndex === 0) {
            return this;
        }
        return null; //can't sub a single group
    }
    get idtype() {
        return this.root.idtype;
    }
    async hist(bins, range = Range.all()) {
        //FIXME
        return RangeHistogram.rangeHist(await this.range());
    }
    vector() {
        return this.asVector();
    }
    asVector() {
        return Promise.all([this.root.asVector(), this.rangeGroup()]).then((arr) => arr[0].view(Range.list(arr[1])));
    }
    origin() {
        return this.root.origin();
    }
    async range() {
        const g = await this.rangeGroup();
        return new CompositeRange1D(g.name, [g]);
    }
    async idRange() {
        const r = await this.root.idRange();
        const g = r.groups[this.groupIndex];
        return new CompositeRange1D(g.name, [g]);
    }
    async rangeGroup() {
        const r = await this.root.range();
        return r.groups[this.groupIndex];
    }
    async names(range = Range.all()) {
        const g = await this.rangeGroup();
        const r = Range.list(g).preMultiply(ParseRangeUtils.parseRangeLike(range));
        return this.root.names(r);
    }
    async ids(range = Range.all()) {
        const g = await this.rangeGroup();
        const r = Range.list(g).preMultiply(ParseRangeUtils.parseRangeLike(range));
        return this.root.ids(r);
    }
    idView(idRange = Range.all()) {
        return Promise.reject('not implemented');
    }
    toString() {
        return this.persist();
    }
    get idtypes() {
        return [this.idtype];
    }
    size() {
        return [this.length];
    }
    get length() {
        return this.groupDesc.size;
    }
    get dim() {
        return this.size();
    }
    persist() {
        return {
            root: this.root.persist(),
            group: this.groupIndex
        };
    }
    restore(persisted) {
        return this;
    }
}
//# sourceMappingURL=StratificationGroup.js.map