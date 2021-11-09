import * as React from 'react';
export const CDCGroupingFilterId = 'group';
export const CDCGroupingFilter = {
    clazz: CDCGroupingFilterComponent,
    disableDropping: true
};
export function createCDCGroupingFilter(id) {
    return {
        id,
        operator: 'AND',
        children: [],
        type: CDCGroupingFilterId,
    };
}
function CDCGroupingFilterComponent() {
    return React.createElement("div", null,
        React.createElement("br", null));
}
//# sourceMappingURL=CDCGroupingFilter.js.map