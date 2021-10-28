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
    return `(${value.config.field} >= ${value.value.min} and ${value.config.field} <= ${value.value.max})`;
}
function CDCRangeFilterComponent({ value, onValueChanged, disabled }) {
    var _a;
    return React.createElement("div", { className: "t360-input-range-wrapper", style: { margin: '10px', paddingTop: '10px', minHeight: '50px' } },
        React.createElement("h6", null, (_a = value === null || value === void 0 ? void 0 : value.config) === null || _a === void 0 ? void 0 : _a.label),
        React.createElement(InputRange, { disabled: !onValueChanged || disabled, minValue: value.config.minValue, maxValue: value.config.maxValue, value: value.value, onChange: (v) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({ ...value, value: v }) }));
}
//# sourceMappingURL=CDCRangeFilter.js.map