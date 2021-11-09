import * as React from 'react';
import InputRange from 'react-input-range';
export const CDCRangeFilterId = 'range';
export const CDCRangeFilter = {
    clazz: CDCRangeFilterComponent,
    disableDropping: true
};
export function createCDCRangeFilter(id, field, value) {
    return {
        id,
        type: CDCRangeFilterId,
        field: field,
        value: value,
    };
}
function CDCRangeFilterComponent({ value, onValueChanged, disabled, config, field }) {
    return React.createElement("div", { className: "t360-input-range-wrapper", style: { margin: '10px', paddingTop: '10px', minHeight: '50px' } },
        React.createElement("h6", null, field),
        React.createElement(InputRange, { disabled: !onValueChanged || disabled, minValue: config.minValue, maxValue: config.maxValue, value: value, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(e) }));
}
//# sourceMappingURL=CDCRangeFilter.js.map