import { PropertyHandler } from './PropertyHandler';
export class CommonPropertyHandler extends PropertyHandler {
    constructor() {
        super(...arguments);
        this.debounceTimer = -1;
        this.updated = () => {
            this.parse(this.propertySource);
            this.fire(CommonPropertyHandler.EVENT_HASH_CHANGED);
        };
    }
    init() {
        const bak = window.history.state;
        if (bak) {
            Object.keys(bak).forEach((k) => this.map.set(k, bak[k]));
        }
        else {
            this.parse(this.propertySource);
        }
    }
    /**
     * Remove event listener, ...
     */
    destroy() {
        // hook
    }
    toURLString() {
        return this.toString() === '' ? '' : this.propertySymbol + this.toString();
    }
    setInt(name, value, update = true) {
        this.setProp(name, String(value), update);
    }
    setProp(name, value, update = true) {
        if (this.map.get(name) === value) {
            return;
        }
        this.map.set(name, value);
        if (update !== false) {
            this.update(typeof update === 'number' ? update : 0);
        }
    }
    removeProp(name, update = true) {
        if (this.map.has(name)) {
            this.map.delete(name);
            if (update !== false) {
                this.update(typeof update === 'number' ? update : 0);
            }
            return true;
        }
        return false;
    }
    toObject() {
        const r = {};
        this.map.forEach((v, k) => (r[k] = v));
        return r;
    }
    update(updateInMs = 0) {
        if (updateInMs <= 0) {
            this.clearDebounceTimer();
            this.updateImpl();
        }
        this.clearDebounceTimer();
        this.debounceTimer = window.setTimeout(() => {
            this.clearDebounceTimer();
            this.updateImpl();
        }, updateInMs);
    }
    clearDebounceTimer() {
        if (this.debounceTimer <= 0) {
            return;
        }
        window.clearTimeout(this.debounceTimer);
        this.debounceTimer = -1;
    }
    isSameHistoryState() {
        // check if same state
        if (window.history.state) {
            const current = window.history.state;
            const keys = Object.keys(current);
            if (keys.length === this.map.size && keys.every((k) => this.map.get(k) === current[k])) {
                return true;
            }
        }
        return false;
    }
}
CommonPropertyHandler.EVENT_STATE_PUSHED = 'pushedState';
CommonPropertyHandler.EVENT_HASH_CHANGED = 'hashChanged';
//# sourceMappingURL=CommonPropertyHandler.js.map