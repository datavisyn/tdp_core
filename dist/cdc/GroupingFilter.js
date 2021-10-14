import * as React from 'react';
export function createCDCGroupingFilter(id, name) {
    return {
        id,
        name,
        disableDropping: true,
        operator: "AND",
        children: [],
        component: {
            clazz: CDCGroupingFilter,
        }
    };
}
function CDCGroupingFilter() {
    return React.createElement("div", null,
        React.createElement("br", null));
}
//# sourceMappingURL=GroupingFilter.js.map