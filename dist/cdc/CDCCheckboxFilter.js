import * as React from 'react';
import Checkbox from 'react-three-state-checkbox';
export const CDCCheckboxFilterId = 'checkbox';
export const CDCCheckboxFilter = {
    clazz: CDCCheckboxFilterComponent,
    disableDropping: true
};
export function createCDCCheckboxFilter(id, value) {
    return {
        id,
        type: CDCCheckboxFilterId,
        value: value
    };
}
export function CDCCheckboxFilterComponent({ value, onValueChanged, disabled, config }) {
    const onChange = (value, field, e) => {
        if (value[field] === false) {
            const newVal = {};
            Object.keys(value).forEach((key) => {
                if (key !== field) {
                    newVal[key] = value[key];
                }
            });
            return newVal;
        }
        else {
            return { ...value, [field]: e.target.checked };
        }
    };
    return React.createElement(React.Fragment, null, config.fields.map((field, i) => {
        return (React.createElement("div", { key: i, className: "input-group m-1" },
            React.createElement("div", { className: "form-check" },
                React.createElement(Checkbox, { disabled: disabled, checked: value[field], className: "form-check-input", indeterminate: value[field] == null ? true : false, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(onChange(value, field, e)) }),
                React.createElement("label", { className: "form-check-label", htmlFor: "flexCheckDefault" }, field))));
    }));
}
//# sourceMappingURL=CDCCheckboxFilter.js.map