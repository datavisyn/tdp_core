import * as React from 'react';
import InputRange from 'react-input-range';
export function createCDCRangeFilter(id, name, value) {
    return {
        id,
        name,
        disableDropping: true,
        component: {
            clazz: CDCRangeFilter,
            toFilter: CDCRangeFilterToString,
            value,
        }
    };
}
function CDCRangeFilterToString(value) {
    // Generate filter from value
    return `(date >= ${value.min} and date <= ${value.max})`;
}
function CDCRangeFilter({ value, onValueChanged }) {
    return React.createElement("div", { className: "t360-input-range-wrapper", style: { margin: '10px', paddingTop: '10px', minHeight: '50px' } },
        React.createElement(InputRange, { disabled: !onValueChanged, maxValue: 2021, minValue: 1950, value: { min: value.min, max: value.max }, onChange: (v) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(v) }));
}
//# sourceMappingURL=CDCRangeFilter.js.map