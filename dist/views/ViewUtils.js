import { isEqual } from 'lodash';
export class ViewUtils {
    static toViewPluginDesc(p) {
        const r = p;
        r.selection = r.selection || 'none';
        r.group = { name: 'Other', order: 99, ...r.group };
        r.securityNotAllowedText = r.securityNotAllowedText != null ? r.securityNotAllowedText : false;
        // common typo
        if (r.idType !== undefined) {
            r.idtype = r.idType;
        }
        return r;
    }
    static matchLength(s, length) {
        switch (String(s)) {
            case '':
            case 'none':
            case '0':
                return length === 0;
            case 'any':
                return true;
            case 'single':
            case '1':
            case 'small_multiple':
                return length === 1;
            case 'multiple':
            case 'chooser':
            case 'some':
                return length >= 1;
            case '2':
                return length === 2;
            default:
                return false;
        }
    }
    /**
     * whether the view should be used as small multiple in case of multiple selections
     * @param desc
     * @returns {boolean}
     */
    static showAsSmallMultiple(desc) {
        return desc.selection === 'small_multiple';
    }
    /**
     * whether the view is going to use a chooser for multiple selections
     * @param desc
     * @returns {boolean}
     */
    static willShowChooser(desc) {
        return desc.selection === 'chooser';
    }
    /**
     * compares two selections and return true if they are the same
     * @param {ISelection} a
     * @param {ISelection} b
     * @returns {boolean}
     */
    static isSameSelection(a, b) {
        var _a, _b;
        const aNull = a == null || a.idtype == null;
        const bNull = b == null || b.idtype == null;
        if (aNull || bNull) {
            return aNull === bNull;
        }
        const base = a.idtype.id === b.idtype.id && isEqual((_a = a.ids) === null || _a === void 0 ? void 0 : _a.sort(), (_b = b.ids) === null || _b === void 0 ? void 0 : _b.sort());
        if (!base) {
            return false;
        }
        const aAllSize = a.all ? a.all.size : 0;
        const bAllSize = b.all ? b.all.size : 0;
        if (aAllSize !== bAllSize) {
            return undefined;
        }
        if (aAllSize === 0) {
            return true;
        }
        // same size but not empty check entries
        return Array.from(a.all.entries()).every(([key, value]) => {
            const other = b.all.get(key);
            if (!other) {
                return false;
            }
            return isEqual(value === null || value === void 0 ? void 0 : value.sort(), other === null || other === void 0 ? void 0 : other.sort());
        });
    }
    static createContext(graph, desc, ref) {
        return {
            graph,
            desc: ViewUtils.toViewPluginDesc(desc),
            ref,
        };
    }
}
/**
 * event when one or more elements are selected for the next level
 * @type {string}
 * @argument selection {ISelection}
 */
ViewUtils.VIEW_EVENT_ITEM_SELECT = 'select';
ViewUtils.VIEW_EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';
ViewUtils.VIEW_EVENT_LOADING_FINISHED = 'loadingFinished';
ViewUtils.VIEW_EVENT_UPDATE_SHARED = 'updateShared';
//# sourceMappingURL=ViewUtils.js.map