import * as React from 'react';
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
export function CDCCheckboxFilterComponent({ value, onValueChanged, disabled, config, field }) {
    return React.createElement(React.Fragment, null, Object.entries(value).map(([field, flag], i) => {
        return (React.createElement("div", { key: i, className: "input-group m-1" },
            React.createElement("div", { className: "form-check" },
                React.createElement("input", { className: "form-check-input", type: "checkbox", id: "flexCheckDefault", checked: flag ? true : false, disabled: !onValueChanged || disabled, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                        ...value,
                        [field]: e
                    }) }),
                React.createElement("label", { className: "form-check-label", htmlFor: "flexCheckDefault" }, field))));
    }));
}
//# sourceMappingURL=CDCCheckboxFilter.js.map