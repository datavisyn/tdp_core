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
        .map((v) => `${v.field} in (${v.value.join(',')})`)
        .join(' and ')})`;
}
export function CDCTextFilterComponent({ value, onValueChanged }) {
    return React.createElement(React.Fragment, null,
        value.filter.map((v, i) => {
            var _a;
            return (React.createElement("div", { key: i, className: "input-group m-1" },
                React.createElement("select", { className: "form-select", disabled: !onValueChanged, value: v.field, onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                        ...value,
                        filter: value.filter.map((oldV) => oldV === v
                            ? {
                                ...v,
                                field: e.currentTarget.value,
                                value: []
                            }
                            : oldV)
                    }) },
                    React.createElement("option", { value: "" }, "Select..."),
                    value.fields.map((f) => (React.createElement("option", { value: f.field, key: f.field }, f.field)))),
                React.createElement("div", { style: { width: '70%' } },
                    React.createElement(Select, { closeMenuOnSelect: false, isDisabled: !onValueChanged, isMulti: true, value: v.value.map((value) => ({ label: value, value })), options: (_a = value.fields
                            .find((f) => f.field === v.field)) === null || _a === void 0 ? void 0 : _a.options.map((o) => {
                            return { value: o, label: o };
                        }), onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                            ...value,
                            filter: value.filter.map((oldV) => oldV === v
                                ? {
                                    ...v,
                                    value: e.map((value) => value.value)
                                }
                                : oldV)
                        }) })),
                React.createElement("button", { disabled: !onValueChanged, onClick: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged({
                        ...value,
                        filter: value.filter.filter((oldV) => oldV !== v)
                    }), className: "btn btn-secondary" }, "X")));
        }),
        onValueChanged ? (React.createElement("button", { className: "btn btn-secondary m-1", onClick: () => {
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
            } }, "+")) : null);
}
//# sourceMappingURL=CDCTextFilter.js.map