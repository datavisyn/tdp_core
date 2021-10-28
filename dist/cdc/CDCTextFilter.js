import * as React from 'react';
import Select from 'react-select';
export const CDCTextFilterId = 'text';
export const CDCTextFilter = {
    clazz: CDCTextFilterComponent,
    toFilter: CDCTextFilterToString
};
export function createCDCTextFilter(id, name, value) {
    return {
        id,
        name,
        disableDropping: true,
        componentId: CDCTextFilterId,
        componentValue: value
    };
}
function CDCTextFilterToString(value) {
    // Generate filter from value
    return `(${value.filter
        .map((v) => `${v.field.value} in (${v.value.map((vV => vV.value)).join(',')})`)
        .join(' and ')})`;
}
export function CDCTextFilterComponent({ value, onValueChanged, disabled }) {
    return React.createElement(React.Fragment, null,
        value.filter.map((v, i) => {
            var _a;
            return (React.createElement("div", { key: i, className: "input-group m-1 row" },
                React.createElement("div", { className: "col-3 p-0" },
                    React.createElement(Select, { isDisabled: !onValueChanged || disabled, value: v.field, options: [...value.fields.map((field) => field.field)], onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                            ...value,
                            filter: value.filter.map((oldV) => oldV === v
                                ? {
                                    ...v,
                                    field: e,
                                    value: []
                                }
                                : oldV)
                        }) })),
                React.createElement("div", { className: "col-7 p-0" },
                    React.createElement(Select, { closeMenuOnSelect: false, isDisabled: !onValueChanged || disabled || !v.field, isMulti: true, value: v.value, options: (_a = value.fields.find((f) => f.field === v.field)) === null || _a === void 0 ? void 0 : _a.options, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                            ...value,
                            filter: value.filter.map((oldV) => oldV === v
                                ? {
                                    ...v,
                                    value: e
                                }
                                : oldV)
                        }) })),
                disabled ? null :
                    React.createElement("div", { className: "col-1 p-0" },
                        React.createElement("button", { disabled: !onValueChanged, onClick: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                                ...value,
                                filter: value.filter.filter((oldV) => oldV !== v)
                            }), className: "btn btn-text-secondary" },
                            React.createElement("i", { className: "fas fa-trash" })))));
        }),
        onValueChanged && !disabled ? (React.createElement("button", { className: "btn btn-text-secondary m-1", onClick: () => {
                onValueChanged({
                    ...value,
                    filter: [
                        ...value.filter,
                        {
                            field: '',
                            value: []
                        }
                    ]
                });
            } },
            React.createElement("i", { className: "fas fa-plus" }))) : null);
}
//# sourceMappingURL=CDCTextFilter.js.map