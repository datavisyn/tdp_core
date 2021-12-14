import * as React from 'react';
import Select from 'react-select';
/* tslint:disable-next-line:variable-name */
export const CDCTextFilterId = 'text';
/* tslint:disable-next-line:variable-name */
export const CDCTextFilter = {
    clazz: CDCTextFilterComponent,
    disableDropping: true
};
export function createCDCTextFilter(id, field, value) {
    return {
        id,
        type: CDCTextFilterId,
        field,
        value,
    };
}
export function CDCTextFilterComponent({ value, onValueChanged, disabled, field, config }) {
    var _a;
    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "input-group m-1 row" },
            React.createElement("div", { className: "col-4 p-0" },
                React.createElement(Select, { isDisabled: !onValueChanged || disabled, value: { label: field, value: field }, maxMenuHeight: 200, menuPlacement: "auto", options: [...config === null || config === void 0 ? void 0 : config.map((conf) => { return { label: conf.field, value: conf.field }; })], onChange: (e) => {
                        onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged([], e.value);
                    } })),
            React.createElement("div", { className: "col-8 p-0" },
                React.createElement(Select, { closeMenuOnSelect: false, isDisabled: !onValueChanged || disabled || !field, maxMenuHeight: 200, menuPlacement: "auto", isMulti: true, value: value === null || value === void 0 ? void 0 : value.map((v) => { return { label: v, value: v }; }), options: (_a = config === null || config === void 0 ? void 0 : config.find((f) => (f === null || f === void 0 ? void 0 : f.field) === field)) === null || _a === void 0 ? void 0 : _a.options.map((o) => { return { label: o, value: o }; }), onChange: (e) => onValueChanged === null || onValueChanged === void 0 ? void 0 : onValueChanged([...e.map((v) => v.value)]) }))));
}
//# sourceMappingURL=CDCTextFilter.js.map