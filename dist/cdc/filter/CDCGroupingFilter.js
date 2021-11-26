import * as React from 'react';
/* tslint:disable-next-line:variable-name */
export const CDCGroupingFilterId = 'group';
/* tslint:disable-next-line:variable-name */
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