import * as React from 'react';
import Checkbox from 'react-three-state-checkbox';
/* tslint:disable-next-line:variable-name */
export const CDCCheckboxFilterId = 'checkbox';
/* tslint:disable-next-line:variable-name */
export const CDCCheckboxFilter = {
    clazz: CDCCheckboxFilterComponent,
    disableDropping: true
};
export function createCDCCheckboxFilter(id, value) {
    return {
        id,
        type: CDCCheckboxFilterId,
        value
    };
}
export function CDCCheckboxFilterComponent({ value, onValueChanged, disabled, config }) {
    return React.createElement(React.Fragment, null, config.fields.map((field, i) => {
        return (React.createElement("div", { key: i, className: "input-group m-1" },
            React.createElement("div", { className: "form-check" },
                React.createElement(Checkbox, { disabled: disabled, checked: value[field], className: "form-check-input", indeterminate: value[field] == null ? true : false, onChange: (e) => {
                        if (value[field] === false) {
                            const newVal = {};
                            Object.keys(value).forEach((key) => {
                                if (key !== field) {
                                    newVal[key] = value[key];
                                }
                            });
                            onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged(newVal);
                        }
                        else {
                            onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({ ...value, [field]: e.target.checked });
                        }
                    } }),
                React.createElement("label", { className: "form-check-label", htmlFor: "flexCheckDefault" }, field))));
    }));
}
//# sourceMappingURL=CDCCheckboxFilter.js.map