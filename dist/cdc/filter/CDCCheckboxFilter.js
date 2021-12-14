import * as React from 'react';
import { uniqueId } from 'lodash';
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
    const id = React.useMemo(() => uniqueId('CDCCheckboxFilterComponent'), []);
    return React.createElement(React.Fragment, null, config.fields.map((field, i) => {
        return (React.createElement("div", { key: i, className: "input-group m-1" },
            React.createElement("div", { className: "form-check" },
                React.createElement("input", { className: "form-check-input", type: "checkbox", value: "", id: `${id}-${field}`, disabled: disabled, checked: value[field], onChange: (e) => {
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
                React.createElement("label", { className: "form-check-label", htmlFor: `${id}-${field}` }, field))));
    }));
}
//# sourceMappingURL=CDCCheckboxFilter.js.map