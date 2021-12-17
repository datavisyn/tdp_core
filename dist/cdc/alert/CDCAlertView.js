import React from 'react';
import Select from 'react-select';
import { ErrorMessage } from '../common';
import { useAsync } from '../../hooks';
import { deleteAlert, editAlert, saveAlert } from '../api';
import { CDCFilterCreator } from '../creator';
import { CDCDataChangeTable } from './CDCDataChangeTable';
export function CDCAlertView({ alertData, setAlertData, onAlertChanged, selectedAlert, setCreationMode, creationMode, cdcConfig }) {
    var _a, _b, _c, _d;
    const [editMode, setEditMode] = React.useState(false);
    const [deleteMode, setDeleteMode] = React.useState(false);
    const [validFilter, setValidFilter] = React.useState(true);
    const [validName, setValidName] = React.useState(true);
    const [validCompareColumns, setValidCompareColumns] = React.useState(true);
    const [activePage, setActivePage] = React.useState('info');
    const { status: deleteStatus, error: deleteError, execute: doDelete } = useAsync(async () => {
        setEditMode(false);
        await deleteAlert(selectedAlert.id);
        onAlertChanged();
    });
    const { status: saveStatus, error: saveError, execute: doSave } = useAsync(async () => {
        var _a, _b;
        const valFilter = !!(alertData === null || alertData === void 0 ? void 0 : alertData.filter);
        const valName = ((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0;
        const valCompareColumns = ((_b = alertData === null || alertData === void 0 ? void 0 : alertData.compare_columns) === null || _b === void 0 ? void 0 : _b.length) > 0;
        if (valFilter && valName && valCompareColumns) {
            let newAlert;
            if (selectedAlert) {
                newAlert = await editAlert(selectedAlert.id, { ...alertData });
                setEditMode(false);
            }
            else {
                newAlert = await saveAlert({ ...alertData });
                setCreationMode(false);
            }
            onAlertChanged(newAlert.id);
        }
        setValidFilter(valFilter);
        setValidName(valName);
        setValidCompareColumns(valCompareColumns);
    });
    // TODO: CDCs are more complex than just filters, i.e. they also have fields.
    const cdcs = Object.keys(cdcConfig);
    const filterSelection = (_a = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _a === void 0 ? void 0 : _a.filters;
    const compareColumns = (_b = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _b === void 0 ? void 0 : _b.compareColumns;
    const filterComponents = (_c = cdcConfig[alertData === null || alertData === void 0 ? void 0 : alertData.cdc_id]) === null || _c === void 0 ? void 0 : _c.components;
    React.useEffect(() => {
        if (selectedAlert) {
            setEditMode(false);
            setDeleteMode(false);
            setActivePage('info');
        }
    }, [selectedAlert]);
    const onDiscard = () => {
        setEditMode(false);
        setAlertData(selectedAlert);
    };
    return (React.createElement("div", { className: `${saveStatus === 'pending' ? 'tdp-busy-overlay' : ''}` },
        (selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.latest_error) ?
            React.createElement(ErrorMessage, { error: new Error(`In the sync from ${new Date(selectedAlert.latest_error_date)} an error occured: ${selectedAlert.latest_error}`) })
            : deleteError ?
                React.createElement(ErrorMessage, { error: new Error(`While deleting an error occured: ${deleteError}`) })
                : saveError ?
                    React.createElement(ErrorMessage, { error: new Error(`While saving an error occured: ${saveError}`) })
                    : null,
        React.createElement("ul", { className: "nav nav-tabs" },
            React.createElement("li", { className: "nav-item" },
                React.createElement("a", { className: `nav-link ${activePage === 'info' ? 'active' : ''}`, href: "#", onClick: (e) => {
                        e.preventDefault();
                        setActivePage('info');
                    } }, "Information")),
            !editMode && !creationMode ? React.createElement("li", { className: "nav-item" },
                React.createElement("a", { className: `nav-link ${activePage === 'data' ? 'active' : ''}`, href: "#", onClick: (e) => {
                        e.preventDefault();
                        setActivePage('data');
                    } }, (selectedAlert === null || selectedAlert === void 0 ? void 0 : selectedAlert.latest_diff) ? 'Data revision from: ' + ((_d = new Date(selectedAlert.latest_compare_date)) === null || _d === void 0 ? void 0 : _d.toLocaleDateString()) : 'Data')) : null,
            React.createElement("small", { className: "d-flex justify-content-end flex-grow-1" }, saveStatus === 'pending' || deleteStatus === 'pending' ? (React.createElement("i", { className: "fas fa-spinner fa-spin" })) : !editMode && !deleteMode && !creationMode ? (React.createElement(React.Fragment, null,
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
                    React.createElement("i", { className: "fas fa-times" })))))),
        React.createElement("div", { className: "overflow-auto h-100 d-flex flex-column container" },
            activePage === 'data' && !editMode && !creationMode ? React.createElement(CDCDataChangeTable, { selectedAlert: selectedAlert, onAlertChanged: onAlertChanged }) : null,
            activePage === 'info' ? React.createElement(React.Fragment, null,
                React.createElement("div", { className: "row mb-3 mt-3" },
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
                        React.createElement(Select, { isDisabled: !creationMode && !editMode, options: cdcs.map((c) => ({ label: c, value: c })), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value, compare_columns: null }) })),
                    React.createElement("div", { className: "mb-3 col pe-2" },
                        React.createElement("label", { className: "form-label" }, "Change Fields"),
                        React.createElement(Select, { isMulti: true, className: `${validCompareColumns ? '' : 'form-control is-invalid'}`, isDisabled: !creationMode && !editMode, closeMenuOnSelect: false, options: compareColumns === null || compareColumns === void 0 ? void 0 : compareColumns.map((c) => ({ label: c, value: c })), 
                            //check for compare_columns because otherwise it would not reset the selection after the cdc_id was changed
                            value: alertData.compare_columns ? alertData.compare_columns.map((c) => ({ label: c, value: c })) : null, onChange: (e) => setAlertData({ ...alertData, compare_columns: e.map((col) => col.value) }) }),
                        validCompareColumns ? null :
                            React.createElement("div", { className: "invalid-feedback" }, "Change fields must not be empty!")),
                    React.createElement("div", { className: "mb-3 col" },
                        React.createElement("label", { className: "form-label" }, "Email notification"),
                        React.createElement("div", { className: "form-check" },
                            React.createElement("input", { className: "form-check-input", id: "CDCAlertViewMailCheckbox", type: "checkbox", disabled: !creationMode && !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                            React.createElement("label", { className: "form-check-label ms-2", htmlFor: "CDCAlertViewMailCheckbox" }, "Send me an email")))),
                React.createElement("div", null, filterSelection && (alertData === null || alertData === void 0 ? void 0 : alertData.filter) ?
                    React.createElement(CDCFilterCreator, { filterSelection: !creationMode && !editMode ? null : filterSelection, filterComponents: filterComponents, filter: alertData.filter, setFilter: (filter) => setAlertData({ ...alertData, filter }), isInvalid: !validFilter })
                    :
                        React.createElement("p", null, "No filters available for this cdc"))) : null)));
}
//# sourceMappingURL=CDCAlertView.js.map