import * as React from 'react';
export const CDCGroupingFilterId = 'group';
export const CDCGroupingFilter = {
    clazz: CDCGroupingFilterComponent,
};
export function createCDCGroupingFilter(id, name) {
    return {
        id,
        name,
        disableDropping: true,
        operator: 'AND',
        children: [],
        componentId: CDCGroupingFilterId,
        componentValue: null
    };
}
function CDCGroupingFilterComponent() {
    return React.createElement("div", null,
        React.createElement("br", null));
}
//# sourceMappingURL=CDCGroupingFilter.js.map