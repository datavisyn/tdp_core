import { CommonPropertyHandler } from './CommonPropertyHandler';
/**
 * manages the hash location property helper
 */
export class HashPropertyHandler extends CommonPropertyHandler {
    constructor() {
        super();
        this.init();
        window.addEventListener('hashchange', this.updated, false);
    }
    get propertySource() {
        return window.location.hash;
    }
    get propertySymbol() {
        return '#';
    }
    toURLString() {
        return this.toString() === '' ? '' : this.propertySymbol + this.toString();
    }
    updateImpl() {
        if (this.isSameHistoryState()) {
            return;
        }
        // remove event listner before changing the hash to avoid an infinite loop
        window.removeEventListener('hashchange', this.updated, false);
        window.history.pushState(this.toObject(), `State ${Date.now()}`, this.toURLString());
        window.addEventListener('hashchange', this.updated, false);
        this.fire(CommonPropertyHandler.EVENT_STATE_PUSHED, `State ${Date.now()}`, this.toURLString());
    }
    destroy() {
        window.removeEventListener('hashchange', this.updated, false);
    }
}
export const hashPropertyHandler = new HashPropertyHandler();
//# sourceMappingURL=HashPropertyHandler.js.map