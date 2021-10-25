import * as React from 'react';
import InputRange from 'react-input-range';
export const CDCRangeFilterId = 'range';
export const CDCRangeFilter = {
    clazz: CDCRangeFilterComponent,
    toFilter: CDCRangeFilterToString
};
export function createCDCRangeFilter(id, name, value) {
    return {
        id,
        name,
        disableDropping: true,
        componentId: CDCRangeFilterId,
        componentValue: value
    };
}
function CDCRangeFilterToString(value) {
    // Generate filter from value
    return `(item["id"] >= ${value.min} and item["id"] <= ${value.max})`;
}
function CDCRangeFilterComponent({ value, onValueChanged, disabled }) {
    return React.createElement("div", { className: "t360-input-range-wrapper", style: { margin: '10px', paddingTop: '10px', minHeight: '50px' } },
        React.createElement(InputRange, { disabled: !onValueChanged || disabled, minValue: 1, maxValue: 10, value: { min: value.min, max: value.max }, onChange: (v) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(v) }));
}
//# sourceMappingURL=CDCRangeFilter.js.map