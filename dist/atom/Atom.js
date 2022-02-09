import { BaseUtils } from '../base/BaseUtils';
import { ValueTypeUtils } from '../data/valuetype';
import { AtomUtils } from './IAtom';
import { LocalIDAssigner } from '../idtype';
import { AAtom } from './AAtom';
import { Range } from '../range';
const noValue = {
    id: -1,
    name: '',
    value: null,
};
export class Atom extends AAtom {
    constructor(desc, loaded) {
        super(desc);
        this.loaded = loaded;
    }
    id() {
        return Promise.resolve(Range.list(this.loaded.id));
    }
    name() {
        return Promise.resolve(this.loaded.name);
    }
    data() {
        return Promise.resolve(this.loaded.value);
    }
    static create(desc) {
        if (typeof desc.data !== undefined) {
            return new Atom(desc, desc.data);
        }
        return new Atom(desc, noValue);
    }
    static asAtom(name, value, options = {}) {
        const desc = BaseUtils.mixin(AtomUtils.createDefaultAtomDesc(), {
            value: ValueTypeUtils.guessValueTypeDesc([value]),
        }, options);
        const rowAssigner = options.rowassigner || LocalIDAssigner.create();
        const atom = {
            name,
            value,
            id: rowAssigner([name]).first,
        };
        return new Atom(desc, atom);
    }
}
//# sourceMappingURL=Atom.js.map