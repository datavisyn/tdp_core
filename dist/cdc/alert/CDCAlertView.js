import React from 'react';
import Select from 'react-select';
import { CDC_DEFAULT_FILTER, ErrorMessage, runAlert } from '..';
import { useAsync } from '../../hooks';
import { deleteAlert, editAlert, saveAlert } from '../api';
import { CDCFilterCreator } from '../creator';
import { CDCDataChangeTable } from './CDCDataChangeTable';
export function CDCAlertView({ alertData, setAlertData, filter, setFilter, onAlertChanged, selectedAlert, setCreationMode, creationMode, cdcConfig }) {
    var _a;
    const [editMode, setEditMode] = React.useState(false);
    const [deleteMode, setDeleteMode] = React.useState(false);
    const [filterSelection, setFilterSelection] = React.useState();
    const [compareColumns, setCompareColumns] = React.useState();
    const [filterComponents, setFilterComponents] = React.useState();
    const [validFilter, setValidFilter] = React.useState();
    const [validName, setValidName] = React.useState();
    const { status: deleteStatus, error: deleteError, execute: doDelete } = useAsync(async () => {
        setEditMode(false);
        await deleteAlert(selectedAlert.id);
        onAlertChanged();
    }, false);
    const { status: saveStatus, error: saveError, execute: doSave } = useAsync(async () => {
        var _a;
        const valFilter = (filter === null || filter === void 0 ? void 0 : filter.children.length) > 0;
        const valName = ((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0;
        if (valFilter && valName) {
            let newAlert;
            if (selectedAlert) {
                newAlert = await editAlert(selectedAlert.id, { ...alertData, filter })
                    .then((alert) => {
                    return runAlert(alert.id).then((a) => {
                        return a ? a : alert;
                    });
                });
                setEditMode(false);
            }
            else {
                newAlert = await saveAlert({ ...alertData, filter })
                    .then((alert) => {
                    return runAlert(alert.id).then((a) => {
                        return a ? a : alert;
                    });
                });
                setCreationMode(false);
            }
            onAlertChanged(newAlert.id);
        }
        setValidFilter(valFilter);
        setValidName(valName);
    }, false);
    // TODO: CDCs are more complex than just filters, i.e. they also have fields.
    const cdcs = Object.keys(cdcConfig);
    React.useEffect(() => {
        var _a, _b, _c;
        setFilterSelection((_a = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _a === void 0 ? void 0 : _a.filters);
        setCompareColumns((_b = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _b === void 0 ? void 0 : _b.compareColumns);
        setFilterComponents((_c = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _c === void 0 ? void 0 : _c.components);
    }, [alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]);
    React.useEffect(() => {
        setEditMode(false);
        setDeleteMode(false);
    }, [selectedAlert]);
    const onDiscard = () => {
        setEditMode(false);
        setAlertData(selectedAlert);
        setFilter(selectedAlert.filter);
    };
    const onCDCChanged = (e) => {
        setAlertData({ ...alertData, cdc_id: e.value, compare_columns: null });
        setFilter(CDC_DEFAULT_FILTER);
    };
    const editButton = !editMode && !deleteMode && !creationMode ? (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Edit Alert", className: "btn btn-text-secondary", onClick: () => setEditMode(true) },
            React.createElement("i", { className: "fas fa-pencil-alt" })),
        React.createElement("button", { title: "Delete Alert", className: "btn btn-text-secondary", onClick: () => setDeleteMode(true) },
            React.createElement("i", { className: "fas fa-trash" })))) : (editMode || creationMode ? React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: () => doSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: editMode ? () => onDiscard() : () => setCreationMode(false) },
            React.createElement("i", { className: "fas fa-times" }))) : React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Delete", className: "btn btn-text-secondary", onClick: () => doDelete() },
            React.createElement("i", { className: "fas fa-check" })),
        React.createElement("button", { title: "No Delete", className: "btn btn-text-secondary ms-1", onClick: () => setDeleteMode(false) },
            React.createElement("i", { className: "fas fa-times" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-md-flex justify-content-md-end" },
            React.createElement(ErrorMessage, { error: deleteError || saveError }),
            React.createElement("small", null, editButton)),
        React.createElement("div", { className: "accordion", id: "editAlert" },
            !editMode && !creationMode ?
                React.createElement("div", { key: "one", className: "accordion-item" },
                    React.createElement("h2", { className: "accordion-header", id: "heading-one" },
                        React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#collapse-one", "aria-expanded": "true", "aria-controls": "collapse-one" }, `${selectedAlert.latest_diff ? 'Latest revision from: ' + ((_a = new Date(selectedAlert.latest_compare_date)) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) : 'No new data'}`)),
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
                                        React.createElement("input", { type: "text", className: `form-control${validName !== false ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }), required: true }),
                                        validName !== false ? null :
                                            React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!"))),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "CDC"),
                            React.createElement(Select, { isDisabled: !creationMode && !editMode, options: cdcs.map((c) => ({ label: c, value: c })), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => onCDCChanged(e) })),
                        React.createElement("div", { className: "mb-3 col pe-2" },
                            React.createElement("label", { className: "form-label" }, "Change Fields"),
                            React.createElement(Select, { isMulti: true, isDisabled: !creationMode && !editMode, closeMenuOnSelect: false, options: compareColumns === null || compareColumns === void 0 ? void 0 : compareColumns.map((c) => ({ label: c, value: c })), 
                                //check for compare_columns because otherwise it would not reset the selection after the cdc_id was changed
                                value: alertData.compare_columns ? alertData.compare_columns.map((c) => ({ label: c, value: c })) : null, onChange: (e) => setAlertData({ ...alertData, compare_columns: e.map((col) => col.value) }) })),
                        React.createElement("div", { className: "mb-3 col" },
                            React.createElement("label", { className: "form-label" }, "Email notification"),
                            React.createElement("div", { className: "form-check" },
                                React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: !creationMode && !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                                React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
                    React.createElement("div", null, filterSelection || !filter ?
                        React.createElement(CDCFilterCreator, { filterSelection: !creationMode && !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, isInvalid: validFilter === false })
                        :
                            React.createElement("p", null, "No filters available for this cdc")))))));
}
//# sourceMappingURL=CDCAlertView.js.map