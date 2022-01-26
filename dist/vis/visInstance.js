import { UniqueIdManager } from '../app/UniqueIdManager';
import { EventHandler } from '../base/event';
/**
 * base class for an visualization
 */
export class AVisInstance extends EventHandler {
    constructor() {
        super(...arguments);
        this.id = UniqueIdManager.getInstance().uniqueId('vis');
        this._built = false;
    }
    option(name, value) {
        //dummy
        //if (value) {
        //  this.fire('option', name, value, null);
        //}
        return null;
    }
    persist() {
        return null;
    }
    get isBuilt() {
        return this._built;
    }
    markReady(built = true) {
        this._built = built;
        if (built) {
            this.fire('ready');
        }
    }
    locate(...selectionIds) {
        if (selectionIds.length === 1) {
            return this.locateImpl(selectionIds[0]);
        }
        return Promise.all(selectionIds.map((sel) => this.locateImpl(sel)));
    }
    async locateById(...selectionIndices) {
        if (selectionIndices.length === 1) {
            return this.locateImpl(selectionIndices[0]);
        }
        return Promise.all(selectionIndices.map((r) => this.locateImpl(r)));
    }
    locateImpl(selectionIndices) {
        //no resolution by default
        return Promise.resolve(null);
    }
    restore(persisted) {
        return Promise.resolve(this);
    }
    update() {
        //do nothing
    }
    destroy() {
        // nothing to destroy
        const n = this.node;
        const w = n ? n.ownerDocument.defaultView : null;
        if (n && n.parentNode && !(w && w.event && w.event.type === 'DOMNodeRemoved' && w.event.target === n)) {
            n.parentNode.removeChild(n);
        }
        this.fire('destroyed');
    }
    transform() {
        return {
            scale: [1, 1],
            rotate: 0
        };
    }
    get rawSize() {
        return [100, 100];
    }
    get size() {
        const t = this.transform();
        const r = this.rawSize;
        //TODO rotation
        return [r[0] * t.scale[0], r[1] * t.scale[1]];
    }
}
//# sourceMappingURL=visInstance.js.map