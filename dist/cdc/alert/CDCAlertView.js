import React from 'react';
import Select from 'react-select';
import { runAlert } from '..';
import { deleteAlert, editAlert, saveAlert } from '../api';
import { CDCFilterCreator } from '../creator';
import { CDCDataChangeTable } from './CDCDataChangeTable';
export function CDCAlertView({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs, compareColumnOptions, setCreationMode, creationMode }) {
    var _a, _b, _c;
    const [editMode, setEditMode] = React.useState(false);
    const [deleteMode, setDeleteMode] = React.useState(false);
    const validFilter = (filter === null || filter === void 0 ? void 0 : filter.children.length) > 0;
    const validName = ((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0;
    React.useEffect(() => {
        setEditMode(false);
        setDeleteMode(false);
    }, [selectedAlert]);
    const onCreateSave = async () => {
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
    const onEditSave = async () => {
        if (validFilter && validName) {
            const newAlert = await editAlert(selectedAlert.id, { ...alertData, filter })
                .then((alert) => {
                return runAlert(alert.id).then((a) => {
                    return a ? a : alert;
                });
            });
            onAlertChanged(newAlert.id);
            setEditMode(false);
        }
    };
    const onDiscard = () => {
        setEditMode(false);
        setAlertData(selectedAlert);
        setFilter(selectedAlert.filter);
    };
    const onDelete = async (id) => {
        setEditMode(false);
        await deleteAlert(id);
        onAlertChanged();
    };
    const editButton = !editMode && !deleteMode && !creationMode ? (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Edit Alert", className: "btn btn-text-secondary", onClick: () => setEditMode(true) },
            React.createElement("i", { className: "fas fa-pencil-alt" })),
        React.createElement("button", { title: "Delete Alert", className: "btn btn-text-secondary", onClick: () => setDeleteMode(true) },
            React.createElement("i", { className: "fas fa-trash" })))) : (editMode || creationMode ? React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: editMode ? () => onEditSave() : () => onCreateSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: editMode ? () => onDiscard() : () => setCreationMode(false) },
            React.createElement("i", { className: "fas fa-times" }))) : React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Delete", className: "btn btn-text-secondary", onClick: () => onDelete(selectedAlert.id) },
            React.createElement("i", { className: "fas fa-check" })),
        React.createElement("button", { title: "No Delete", className: "btn btn-text-secondary ms-1", onClick: () => setDeleteMode(false) },
            React.createElement("i", { className: "fas fa-times" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Your options"),
            React.createElement("small", null, editButton)),
        React.createElement("div", { className: "accordion", id: "editAlert" },
            !editMode && !creationMode ?
                React.createElement("div", { key: "one", className: "accordion-item" },
                    React.createElement("h2", { className: "accordion-header", id: "heading-one" },
                        React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#collapse-one", "aria-expanded": "true", "aria-controls": "collapse-one" }, `${selectedAlert.latest_diff ? 'Latest revision from: ' + ((_b = new Date(selectedAlert.latest_compare_date)) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) : 'No new data'}`)),
                    React.createElement("div", { id: "collapse-one", className: "accordion-collapse collapse show", "aria-labelledby": "heading-one", "data-bs-parent": "#editAlert" },
                        React.createElement(CDCDataChangeTable, { selectedAlert: selectedAlert, onAlertChanged: onAlertChanged })))
                : null,
            React.createElement("div", { key: "two", className: "accordion-item" },
                React.createElement("h2", { className: "accordion-header", id: "heading-two" },
                    React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#collapse-two", "aria-expanded": "true", "aria-controls": "collapse-two" }, "Alert overview")),
                React.createElement("div", { id: "collapse-two", className: `p-4 accordion-collapse collapse${editMode || creationMode ? ' show' : ''}`, "aria-labelledby": "heading-two", "data-bs-parent": "#editAlert" },
                    React.createElement("div", { className: "row mb-3" },
                        React.createElement("div", { className: "mb-3 col" },
                            React.createElement("label", { className: "form-label" }, "Name"),
                            !creationMode && !editMode ?
                                React.createElement("h6", null, alertData.name)
                                :
                                    React.createElement(React.Fragment, null,
                                        React.createElement("input", { type: "text", className: `form-control${validName ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }), required: true }),
                                        validName ? null :
                                            React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!"))),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "CDC"),
                            React.createElement(Select, { isDisabled: !creationMode && !editMode, options: cdcs.map((c) => ({ label: c, value: c })), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value }) })),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "Change Fields"),
                            React.createElement(Select, { isMulti: true, isDisabled: !creationMode && !editMode, closeMenuOnSelect: false, options: compareColumnOptions.map((c) => ({ label: c, value: c })), value: (_c = alertData.compare_columns) === null || _c === void 0 ? void 0 : _c.map((c) => ({ label: c, value: c })), onChange: (e) => setAlertData({ ...alertData, compare_columns: e.map((col) => col.value) }) })),
                        React.createElement("div", { className: "mb-3 col" },
                            React.createElement("label", { className: "form-label" }, "Email notification"),
                            React.createElement("div", { className: "form-check" },
                                React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: true, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                                React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
                    React.createElement("div", null, filterSelection || !filter ?
                        React.createElement(CDCFilterCreator, { filterSelection: !creationMode && !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, isInvalid: !validFilter })
                        :
                            React.createElement("p", null, "No filters available for this cdc")))))));
}
//# sourceMappingURL=CDCAlertView.js.map