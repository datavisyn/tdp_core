import { AppContext } from '../app/AppContext';
import { EventHandler } from '../base/event';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
/**
 * An IDType is a semantic aggregation of an entity type, like Patient and Gene.
 *
 * An entity is tracked by a unique identifier (integer) within the system,
 * which is mapped to a common, external identifier or name (string) as well.
 */
export class IDType extends EventHandler {
    /**
     * @param id the system identifier of this IDType
     * @param name the name of this IDType for external presentation
     * @param names the plural form of above name
     * @param internal whether this is an internal type or not
     */
    constructor(id, name, names, internal = false) {
        super();
        this.id = id;
        this.name = name;
        this.names = names;
        this.internal = internal;
        /**
         * the current selections
         */
        this.sel = new Map();
        this.canBeMappedTo = null;
    }
    persist() {
        const s = {};
        this.sel.forEach((v, k) => {
            s[k] = v;
        });
        return {
            sel: s,
            name: this.name,
            names: this.names,
        };
    }
    restore(persisted) {
        // @ts-ignore
        this.name = persisted.name;
        // @ts-ignore
        this.names = persisted.names;
        Object.keys(persisted.sel).forEach((type) => this.sel.set(type, persisted.sel[type]));
        return this;
    }
    toString() {
        return this.name;
    }
    selectionTypes() {
        return Array.from(this.sel.keys());
    }
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {string[]}
     */
    selections(type = SelectionUtils.defaultSelectionType) {
        if (this.sel.has(type)) {
            return this.sel.get(type);
        }
        const v = [];
        this.sel.set(type, v);
        return v;
    }
    select() {
        // eslint-disable-next-line prefer-rest-params
        const a = Array.from(arguments);
        const type = typeof a[0] === 'string' ? a.shift() : SelectionUtils.defaultSelectionType;
        const selection = a[0];
        const op = SelectionUtils.asSelectOperation(a[1]);
        return this.selectImpl(selection, op, type);
    }
    selectImpl(selection, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
        const b = this.selections(type);
        const newValue = SelectionUtils.integrateSelection(b, selection, op);
        this.sel.set(type, newValue);
        const added = op !== SelectOperation.REMOVE ? selection : [];
        const removed = op === SelectOperation.ADD ? [] : op === SelectOperation.SET ? b : selection;
        this.fire(IDType.EVENT_SELECT, type, newValue, added, removed, b);
        this.fire(`${IDType.EVENT_SELECT}-${type}`, newValue, added, removed, b);
        return b;
    }
    clear(type = SelectionUtils.defaultSelectionType) {
        return this.selectImpl([], SelectOperation.SET, type);
    }
    /**
     * chooses whether a GET or POST request based on the expected url length
     * @param url
     * @param data
     * @returns {Promise<any>}
     */
    static chooseRequestMethod(url, data = {}) {
        const dataLengthGuess = JSON.stringify(data);
        const lengthGuess = url.length + dataLengthGuess.length;
        const method = lengthGuess < 2000 ? 'GET' : 'POST';
        return AppContext.getInstance().sendAPI(url, data, method);
    }
}
IDType.EVENT_SELECT = 'select';
//# sourceMappingURL=IDType.js.map