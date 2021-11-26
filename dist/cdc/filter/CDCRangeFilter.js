import * as React from 'react';
import InputRange from 'react-input-range';
/* tslint:disable-next-line:variable-name */
export const CDCRangeFilterId = 'range';
/* tslint:disable-next-line:variable-name */
export const CDCRangeFilter = {
    clazz: CDCRangeFilterComponent,
    disableDropping: true
};
export function createCDCRangeFilter(id, field, value) {
    return {
        id,
        type: CDCRangeFilterId,
        field,
        value,
    };
}
function CDCRangeFilterComponent({ value, onValueChanged, disabled, config, field }) {
    return React.createElement("div", { className: "t360-input-range-wrapper row", style: { margin: '10px', paddingTop: '10px', minHeight: '50px' } },
        React.createElement("div", { className: "col-2 px-0" },
            React.createElement("h6", null, field)),
        React.createElement("div", { className: "col-10 px-0" },
            React.createElement(InputRange, { disabled: !onValueChanged || disabled, minValue: config.minValue, maxValue: config.maxValue, value: value, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(e) })));
}
//# sourceMappingURL=CDCRangeFilter.js.map