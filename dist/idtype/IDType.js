import { AppContext } from '../app/AppContext';
import { EventHandler } from '../base/event';
import { Range, ParseRangeUtils } from '../range';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { ResolveNow } from '../base/promise';
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
        // TODO: is this cache ever emptied, or do we assume a reasonable upper bound on the entities in IDType?
        this.name2idCache = new Map();
        this.id2nameCache = new Map();
        this.canBeMappedTo = null;
    }
    persist() {
        const s = {};
        this.sel.forEach((v, k) => (s[k] = v.toString()));
        return {
            sel: s,
            name: this.name,
            names: this.names,
        };
    }
    restore(persisted) {
        this.name = persisted.name;
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
     * @returns {Range}
     */
    selections(type = SelectionUtils.defaultSelectionType) {
        if (this.sel.has(type)) {
            return this.sel.get(type);
        }
        const v = Range.none();
        this.sel.set(type, v);
        return v;
    }
    select() {
        // eslint-disable-next-line prefer-rest-params
        const a = Array.from(arguments);
        const type = typeof a[0] === 'string' ? a.shift() : SelectionUtils.defaultSelectionType;
        const range = ParseRangeUtils.parseRangeLike(a[0]);
        const op = SelectionUtils.asSelectOperation(a[1]);
        return this.selectImpl(range, op, type);
    }
    selectImpl(range, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
        const b = this.selections(type);
        let newValue = Range.none();
        switch (op) {
            case SelectOperation.SET:
                newValue = range;
                break;
            case SelectOperation.ADD:
                newValue = b.union(range);
                break;
            case SelectOperation.REMOVE:
                newValue = b.without(range);
                break;
        }
        if (b.eq(newValue)) {
            return b;
        }
        this.sel.set(type, newValue);
        const added = op !== SelectOperation.REMOVE ? range : Range.none();
        const removed = op === SelectOperation.ADD ? Range.none() : op === SelectOperation.SET ? b : range;
        this.fire(IDType.EVENT_SELECT, type, newValue, added, removed, b);
        this.fire(`${IDType.EVENT_SELECT}-${type}`, newValue, added, removed, b);
        return b;
    }
    clear(type = SelectionUtils.defaultSelectionType) {
        return this.selectImpl(Range.none(), SelectOperation.SET, type);
    }
    /**
     * Cache identifier <-> name mapping in bulk.
     * @param ids the entity identifiers to cache
     * @param names the matching entity names to cache
     */
    fillMapCache(ids, names) {
        ids.forEach((id, i) => {
            const name = String(names[i]);
            this.name2idCache.set(name, id);
            this.id2nameCache.set(id, name);
        });
    }
    /**
     * Request the system identifiers for the given entity names.
     * @param names the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    async map(names) {
        names = names.map((s) => String(s)); // ensure strings
        const toResolve = names.filter((name) => !this.name2idCache.has(name));
        if (toResolve.length === 0) {
            return ResolveNow.resolveImmediately(names.map((name) => this.name2idCache.get(name)));
        }
        const ids = await IDType.chooseRequestMethod(`/idtype/${this.id}/map`, { ids: toResolve });
        toResolve.forEach((name, i) => {
            this.name2idCache.set(name, ids[i]);
            this.id2nameCache.set(ids[i], name);
        });
        return names.map((name) => this.name2idCache.get(name));
    }
    /**
     * Request the names for the given entity system identifiers.
     * @param ids the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    async unmap(ids) {
        const r = ParseRangeUtils.parseRangeLike(ids);
        const toResolve = [];
        r.dim(0).forEach((name) => (!this.id2nameCache.has(name) ? toResolve.push(name) : null));
        if (toResolve.length === 0) {
            const result = [];
            r.dim(0).forEach((name) => result.push(this.id2nameCache.get(name)));
            return ResolveNow.resolveImmediately(result);
        }
        const result = await IDType.chooseRequestMethod(`/idtype/${this.id}/unmap`, { ids: Range.list(toResolve).toString() });
        toResolve.forEach((id, i) => {
            const res = String(result[i]);
            this.id2nameCache.set(id, res);
            this.name2idCache.set(res, id);
        });
        const out = [];
        r.dim(0).forEach((name) => out.push(this.id2nameCache.get(name)));
        return out;
    }
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    async search(pattern, limit = 10) {
        const result = await AppContext.getInstance().getAPIJSON(`/idtype/${this.id}/search`, { q: pattern, limit });
        // cache results
        result.forEach((pair) => {
            const r = String(pair.name);
            this.id2nameCache.set(pair.id, r);
            this.name2idCache.set(r, pair.id);
        });
        return result;
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