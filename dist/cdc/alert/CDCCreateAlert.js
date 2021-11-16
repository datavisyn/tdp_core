import React from 'react';
import Select from 'react-select';
import { runAlert } from '..';
import { saveAlert } from '../api';
import { CDCFilterCreator } from '../creator';
export function CDCCreateAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, setCreationMode, cdcs, compareColumnOptions }) {
    var _a;
    const validFilter = (filter === null || filter === void 0 ? void 0 : filter.children.length) > 0;
    const validName = ((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0;
    const onSave = async () => {
        if (validFilter && validName) {
            const newAlert = await saveAlert({ ...alertData, filter })
                .then((alert) => {
                return runAlert(alert.id).then((a) => {
                    return a ? a : alert;
                });
            });
            onAlertChanged(newAlert.id);
            setCreationMode(false);
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Create alert"),
            React.createElement("small", null,
                React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: () => onSave() },
                    React.createElement("i", { className: "fas fa-save" })),
                React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: () => setCreationMode(false) },
                    React.createElement("i", { className: "fas fa-times" })))),
        React.createElement("div", { className: "card p-3" },
            React.createElement("div", { className: "row mb-3" },
                React.createElement("div", { className: "mb-3 col" },
                    React.createElement("label", { className: "form-label" }, "Name"),
                    React.createElement("input", { type: "text", className: `form-control${validName ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }), required: true }),
                    validName ? null :
                        React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!")),
                React.createElement("div", { className: "mb-3 col" },
                    React.createElement("label", { className: "form-label" }, "CDC"),
                    React.createElement(Select, { options: cdcs.map((c) => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value }) })),
                React.createElement("div", { className: "mb-3 col" },
                    React.createElement("label", { className: "form-label" }, "Change Fields"),
                    React.createElement(Select, { isMulti: true, closeMenuOnSelect: false, options: compareColumnOptions.map((o) => ({
                            label: o,
                            value: o
                        })), value: alertData.compare_columns.map((o) => ({
                            label: o,
                            value: o
                        })), onChange: (e) => setAlertData({ ...alertData, compare_columns: e.map(({ value }) => value) }) })),
                React.createElement("div", { className: "mb-3 col" },
                    React.createElement("label", { className: "form-label" }, "Email notification"),
                    React.createElement("div", { className: "form-check" },
                        React.createElement("input", { className: "form-check-input", type: "checkbox", checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                        React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
            React.createElement("div", null, filterSelection || !filter ?
                React.createElement(CDCFilterCreator, { filterSelection: filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, isInvalid: !validFilter })
                :
                    React.createElement("p", null, "No filters available for this cdc")))));
}
//# sourceMappingURL=CDCCreateAlert.js.map