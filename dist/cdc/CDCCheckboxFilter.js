import * as React from 'react';
export function createCDCCheckboxFilter(id, name, value) {
    return {
        id,
        name,
        disableDropping: true,
        component: {
            clazz: CDCCheckboxFilter,
            toFilter: CDCCheckboxFilterToString,
            value,
        }
    };
}
function CDCCheckboxFilterToString(value) {
    // Generate filter from value
    return `(${value === null || value === void 0 ? void 0 : value.fields.map((v) => { return `${v} == ${value.filter.filter((f) => f === v).length > 0}`; }).join(' and ')})`;
}
export function CDCCheckboxFilter({ value, onValueChanged }) {
    return React.createElement(React.Fragment, null, value.fields.map((v, i) => {
        return (React.createElement("div", { key: i, className: "input-group m-1" },
            React.createElement("div", { className: "form-check" },
                React.createElement("input", { className: "form-check-input", type: "checkbox", id: "flexCheckDefault", checked: value.filter.filter((f) => f === v).length > 0, disabled: !onValueChanged, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                        ...value,
                        fields: value.fields,
                        filter: value.filter.filter((f) => f === v).length > 0
                            ? value.filter.filter((f) => f !== v)
                            : [...value.filter, v]
                    }) }),
                React.createElement("label", { className: "form-check-label", htmlFor: "flexCheckDefault" }, v))));
    }));
}
//# sourceMappingURL=CDCCheckboxFilter.js.map