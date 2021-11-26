export const ITEM_TYPES = {
    FILTERCARD: 'filtercard'
};
export const getFilterFromTree = (filter, id) => {
    if ((filter === null || filter === void 0 ? void 0 : filter.id) === id) {
        return { current: filter, parent: null };
    }
    else if (filter && filter.children) {
        // Is the id part of my children?
        const current = filter.children.find((f) => f.id === id);
        if (current) {
            return { parent: filter, current };
        }
        // Otherwise, continue with all children
        for (const f of filter.children) {
            const current = getFilterFromTree(f, id);
            if (current.current) {
                return current;
            }
        }
    }
    return { parent: null, current: null };
};
export function isAlert(obj) {
    var _a;
    return typeof ((_a = obj) === null || _a === void 0 ? void 0 : _a.id) === 'number';
}
//# sourceMappingURL=interfaces.js.map