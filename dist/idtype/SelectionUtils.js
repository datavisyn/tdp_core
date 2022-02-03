export var SelectOperation;
(function (SelectOperation) {
    SelectOperation[SelectOperation["SET"] = 0] = "SET";
    SelectOperation[SelectOperation["ADD"] = 1] = "ADD";
    SelectOperation[SelectOperation["REMOVE"] = 2] = "REMOVE";
})(SelectOperation || (SelectOperation = {}));
export class SelectionUtils {
    static toSelectOperation(event) {
        let ctryKeyDown;
        let shiftDown;
        let altDown;
        let metaDown;
        if (typeof event === 'boolean') {
            ctryKeyDown = event;
            // eslint-disable-next-line prefer-rest-params
            altDown = arguments[1] || false;
            // eslint-disable-next-line prefer-rest-params
            shiftDown = arguments[2] || false;
            // eslint-disable-next-line prefer-rest-params
            metaDown = arguments[3] || false;
        }
        else {
            ctryKeyDown = event.ctrlKey || false;
            altDown = event.altKey || false;
            shiftDown = event.shiftKey || false;
            metaDown = event.metaKey || false;
        }
        if (ctryKeyDown || shiftDown) {
            return SelectOperation.ADD;
        }
        if (altDown || metaDown) {
            return SelectOperation.REMOVE;
        }
        return SelectOperation.SET;
    }
    static asSelectOperation(v) {
        if (!v) {
            return SelectOperation.SET;
        }
        if (typeof v === 'string') {
            switch (v.toLowerCase()) {
                case 'add':
                    return SelectOperation.ADD;
                case 'remove':
                    return SelectOperation.REMOVE;
                default:
                    return SelectOperation.SET;
            }
        }
        return +v;
    }
    static integrateSelection(current, next, op = SelectOperation.SET) {
        if (op === SelectOperation.SET) {
            return next;
        }
        if (SelectOperation.ADD) {
            return Array.from(new Set([...current, ...next]));
        }
        if (SelectOperation.REMOVE) {
            return current.filter((s) => !next.includes(s));
        }
        return [];
    }
}
SelectionUtils.defaultSelectionType = 'selected';
SelectionUtils.hoverSelectionType = 'hovered';
//# sourceMappingURL=SelectionUtils.js.map