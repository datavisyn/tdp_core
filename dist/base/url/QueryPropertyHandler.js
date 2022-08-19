import { CommonPropertyHandler } from './CommonPropertyHandler';
export class QueryPropertyHandler extends CommonPropertyHandler {
    constructor() {
        super();
        this.init();
    }
    get propertySource() {
        return window.location.search;
    }
    get propertySymbol() {
        return '?';
    }
    updateImpl() {
        if (this.isSameHistoryState()) {
            return;
        }
        window.history.pushState(this.toObject(), `State ${Date.now()}`, this.toURLString());
        this.fire(CommonPropertyHandler.EVENT_STATE_PUSHED, `State ${Date.now()}`, this.toURLString());
    }
}
//# sourceMappingURL=QueryPropertyHandler.js.map