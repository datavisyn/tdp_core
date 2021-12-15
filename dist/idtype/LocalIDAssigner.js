import { IdPool } from '../internal/IdPool';
import { Range } from '../range';
export class LocalIDAssigner {
    constructor() {
        this.pool = new IdPool();
        this.lookup = new Map();
    }
    unmapOne(id) {
        return this.unmap([id])[0];
    }
    unmap(ids) {
        const keys = Object.keys(this.lookup);
        return ids.map((id) => {
            for (const k in keys) {
                if (this.lookup.get(k) === id) {
                    return k;
                }
            }
            return null;
        });
    }
    mapOne(id) {
        if (this.lookup.has(id)) {
            return this.lookup.get(id);
        }
        this.lookup.set(id, this.pool.checkOut());
        return this.lookup.get(id);
    }
    map(ids) {
        const numbers = ids.map((d) => this.mapOne(d));
        return Range.list(...numbers);
    }
    static create() {
        const r = new LocalIDAssigner();
        return r.map.bind(r);
    }
}
//# sourceMappingURL=LocalIDAssigner.js.map