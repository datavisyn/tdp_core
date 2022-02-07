import { IdPool } from '../internal/IdPool';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';
export class HasUniqueIdUtils {
    static toId(elem) {
        return elem.id;
    }
    static isId(id) {
        return (elem) => elem && elem.id === id;
    }
}
/**
 * IDType with an actual collection of entities.
 * Supports selections.
 */
export class ObjectManager extends IDType {
    constructor(id, name) {
        super(id, name, `${name}s`, true);
        this.instances = [];
        this.pool = new IdPool();
    }
    nextId(item) {
        const n = this.pool.checkOut();
        if (item) {
            item.id = n;
            this.instances[n] = item;
            this.fire('add', n, item);
        }
        return n;
    }
    push(...items) {
        items.forEach((item) => {
            this.instances[item.id] = item;
            this.fire('add', item.id, item);
        });
    }
    byId(id) {
        return this.instances[id];
    }
    forEach(callbackfn, thisArg) {
        this.instances.forEach((item, i) => (this.pool.isCheckedOut(i) ? callbackfn.call(thisArg, item) : null));
    }
    get entries() {
        return this.instances.filter((item, i) => this.pool.isCheckedOut(i));
    }
    remove(item) {
        let old = null;
        if (typeof item.id === 'number') {
            item = item.id;
        }
        if (typeof item === 'number') {
            old = this.instances[item];
            delete this.instances[item];
            this.fire('remove', item, old);
        }
        // clear from selections
        this.selectionTypes().forEach((type) => {
            this.select(type, [item], SelectOperation.REMOVE);
        });
        this.pool.checkIn(item);
        return old;
    }
    selectedObjects(type = SelectionUtils.defaultSelectionType) {
        const s = this.selections(type);
        return s.filter(this.instances);
    }
}
//# sourceMappingURL=ObjectManager.js.map