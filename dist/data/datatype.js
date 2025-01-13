/**
 * This file defines interfaces for various data types and their metadata.
 */
import { EventHandler } from 'visyn_core/base';
/**
 * dummy data type just holding the description
 */
export class ADataType extends EventHandler {
    constructor(desc) {
        super();
        this.desc = desc;
    }
    get dim() {
        return [];
    }
    idView(ids) {
        return Promise.resolve(this);
    }
    get idtypes() {
        return [];
    }
    persist() {
        return this.desc.id;
    }
    restore(persisted) {
        return this;
    }
    toString() {
        return this.persist();
    }
    /**
     * since there is no instanceOf for interfaces
     * @param v
     * @return {any}
     */
    static isADataType(v) {
        if (v === null || v === undefined) {
            return false;
        }
        if (v instanceof ADataType) {
            return true;
        }
        // sounds good
        return typeof v.persist === 'function' && typeof v.restore === 'function' && 'desc' in v;
    }
}
export class DummyDataType extends ADataType {
}
//# sourceMappingURL=datatype.js.map