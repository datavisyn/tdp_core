export const itemTypes = {
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
export const getTreeQuery = (filter, components) => {
    var _a, _b;
    if (!filter) {
        return '';
    }
    if (!filter.children) {
        //leaf filter
        if (filter &&
            components && ((_a = components[filter.componentId]) === null || _a === void 0 ? void 0 : _a.clazz) && ((_b = components[filter.componentId]) === null || _b === void 0 ? void 0 : _b.toFilter)) {
            return components[filter.componentId].toFilter(filter.componentValue);
        }
        else {
            return '';
        }
    }
    else {
        //go through every child
        let returnValue = '(';
        filter.children.forEach((child, i) => {
            var _a;
            returnValue += `${getTreeQuery(child, components)}${filter.children && i < filter.children.length - 1
                ? ` ${(filter === null || filter === void 0 ? void 0 : filter.operator) === 'NOT'
                    ? 'and not'
                    : (_a = filter === null || filter === void 0 ? void 0 : filter.operator) === null || _a === void 0 ? void 0 : _a.toLowerCase()} `
                : ''}`;
        });
        returnValue += ')';
        return returnValue;
    }
};
export function isAlert(obj) {
    var _a;
    return typeof ((_a = obj) === null || _a === void 0 ? void 0 : _a.id) === 'number';
}
//# sourceMappingURL=interface.js.map