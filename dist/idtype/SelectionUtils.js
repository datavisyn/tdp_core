import { ParseRangeUtils, Range1D } from '../range';
export var SelectOperation;
(function (SelectOperation) {
    SelectOperation[SelectOperation["SET"] = 0] = "SET";
    SelectOperation[SelectOperation["ADD"] = 1] = "ADD";
    SelectOperation[SelectOperation["REMOVE"] = 2] = "REMOVE";
})(SelectOperation || (SelectOperation = {}));
export class SelectionUtils {
    static toSelectOperation(event) {
        let ctryKeyDown, shiftDown, altDown, metaDown;
        if (typeof event === 'boolean') {
            ctryKeyDown = event;
            altDown = arguments[1] || false;
            shiftDown = arguments[2] || false;
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
        else if (altDown || metaDown) {
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
    static fillWithNone(r, ndim) {
        while (r.ndim < ndim) {
            r.dims[r.ndim] = Range1D.none();
        }
        return r;
    }
    static integrateSelection(current, additional, operation = SelectOperation.SET) {
        const next = ParseRangeUtils.parseRangeLike(additional);
        switch (operation) {
            case SelectOperation.ADD:
                return current.union(next);
            case SelectOperation.REMOVE:
                return current.without(next);
            default:
                return next;
        }
    }
}
SelectionUtils.defaultSelectionType = 'selected';
SelectionUtils.hoverSelectionType = 'hovered';
//# sourceMappingURL=SelectionUtils.js.map