import { Range, ParseRangeUtils } from '../range';
import { ASelectAble, IDTypeManager } from '../idtype';
/**
 * base class for different Atom implementations
 * @internal
 */
export class AAtom extends ASelectAble {
    constructor(desc) {
        super();
        this.desc = desc;
    }
    get dim() {
        return [1];
    }
    get valuetype() {
        return this.desc.value;
    }
    get idtype() {
        return IDTypeManager.getInstance().resolveIdType(this.desc.idtype);
    }
    get idtypes() {
        return [this.idtype];
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
        return this.desc.id;
    }
    restore(persisted) {
        return this;
    }
}
//# sourceMappingURL=AAtom.js.map