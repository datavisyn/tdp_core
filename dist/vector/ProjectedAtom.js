import { Range, ParseRangeUtils } from '../range';
import { ASelectAble } from '../idtype';
export class ProjectedAtom extends ASelectAble {
    constructor(v, f, thisArgument = v, valuetype = v.valuetype, _idtype = v.idtype) {
        super();
        this.v = v;
        this.f = f;
        this.thisArgument = thisArgument;
        this.valuetype = valuetype;
        this._idtype = _idtype;
        this.cache = null;
        this.desc = {
            name: `${v.desc.name}-p`,
            fqname: `${v.desc.fqname}-p`,
            type: 'atom',
            id: `${v.desc.id}-p`,
            idtype: v.idtype,
            value: this.valuetype,
            description: v.desc.description,
            creator: v.desc.creator,
            ts: v.desc.ts,
        };
    }
    load() {
        if (this.cache === null) {
            this.cache = Promise.all([this.v.data(), this.v.ids(), this.v.names()]).then((arr) => {
                return this.f.apply(this.thisArgument, arr);
            });
        }
        return this.cache;
    }
    async id() {
        const d = await this.load();
        return Range.list(d.id);
    }
    async name() {
        const d = await this.load();
        return d.name;
    }
    async data() {
        const d = await this.load();
        return d.value;
    }
    get dim() {
        return [1];
    }
    get idtype() {
        return this._idtype;
    }
    get idtypes() {
        return [this._idtype];
    }
    ids(range = Range.all()) {
        range = ParseRangeUtils.parseRangeLike(range);
        if (range.isNone) {
            return Promise.resolve(Range.none());
        }
        return this.id();
    }
    idView(idRange) {
        return Promise.resolve(this);
    }
    persist() {
        return {
            root: this.v.persist(),
            f: this.f.toString(),
            valuetype: this.valuetype === this.v.valuetype ? undefined : this.valuetype,
            idtype: this.idtype === this.v.idtype ? undefined : this.idtype.name,
        };
    }
    restore(persisted) {
        return this;
    }
}
//# sourceMappingURL=ProjectedAtom.js.map