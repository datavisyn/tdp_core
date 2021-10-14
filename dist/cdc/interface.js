export const ItemTypes = {
    FILTERCARD: "filtercard"
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
export const getTreeQuery = (filter) => {
    if (!filter) {
        return "";
    }
    if (!filter.children) {
        //leaf filter
        if (filter.component &&
            filter.component.toFilter &&
            filter.component.value) {
            return filter.component.toFilter(filter.component.value);
        }
        else {
            return "";
        }
    }
    else {
        //go through every child
        let returnValue = "(";
        filter.children.forEach((child, i) => {
            var _a;
            returnValue += `${getTreeQuery(child)}${filter.children && i < filter.children.length - 1
                ? ` ${(filter === null || filter === void 0 ? void 0 : filter.operator) === "NOT"
                    ? "and not"
                    : (_a = filter === null || filter === void 0 ? void 0 : filter.operator) === null || _a === void 0 ? void 0 : _a.toLowerCase()} `
                : ""}`;
        });
        returnValue += ")";
        return returnValue;
    }
};
//# sourceMappingURL=interface.js.map