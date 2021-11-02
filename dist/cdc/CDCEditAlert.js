import React from 'react';
import Select from 'react-select';
import { accordionItem, runAlert } from '.';
import { confirmAlertById, deleteAlert, editAlert } from './api';
import { CDCFilterComponent } from './CDCFilterComponent';
import { getTreeQuery } from './interface';
export function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs }) {
    var _a, _b;
    const [editMode, setEditMode] = React.useState(false);
    const [deleteMode, setDeleteMode] = React.useState(false);
    const [validName, setValidName] = React.useState(true);
    const [validFilter, setValidFilter] = React.useState(true);
    React.useEffect(() => {
        setEditMode(false);
        setDeleteMode(false);
    }, [selectedAlert]);
    React.useEffect(() => {
        setValidFilter((filter === null || filter === void 0 ? void 0 : filter.children.length) > 0);
    }, [filter]);
    React.useEffect(() => {
        var _a;
        setValidName(((_a = alertData === null || alertData === void 0 ? void 0 : alertData.name) === null || _a === void 0 ? void 0 : _a.trim().length) > 0);
    }, [alertData.name]);
    const confirmChanges = async (id) => {
        const alert = await confirmAlertById(id);
        onAlertChanged(alert.id);
    };
    const onSave = async () => {
        if (validFilter && validName) {
            const newAlert = await editAlert(selectedAlert.id, {
                ...alertData,
                filter_dump: JSON.stringify(filter),
                filter_query: getTreeQuery(filter, filterComponents)
            }).then((alert) => {
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
        setFilter(JSON.parse(selectedAlert.filter_dump));
    };
    const onDelete = async (id) => {
        setEditMode(false);
        await deleteAlert(id);
        onAlertChanged();
    };
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "row mb-3" },
            React.createElement("div", { className: "mb-3 col" },
                React.createElement("label", { className: "form-label" }, "Name"),
                !editMode ?
                    React.createElement("p", null, alertData.name)
                    :
                        React.createElement(React.Fragment, null,
                            React.createElement("input", { type: "text", className: `form-control${validName ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }) }),
                            validName ? null :
                                React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!"))),
            React.createElement("div", { className: "mb-3 col" },
                React.createElement("label", { className: "form-label" }, "CDC"),
                React.createElement(Select, { isDisabled: !editMode, options: cdcs.map((c) => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value }) })),
            React.createElement("div", { className: "mb-3 col" },
                React.createElement("label", { className: "form-label" }, "Email notification"),
                React.createElement("div", { className: "form-check" },
                    React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                    React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
        React.createElement("div", null, filterSelection || !filter ?
            React.createElement(CDCFilterComponent, { filterSelection: !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, disableFilter: !editMode, isInvalid: !validFilter })
            :
                React.createElement("p", null, "No filters available for this cdc"))));
    const literature = () => {
        var _a;
        const data = (_a = JSON.parse(selectedAlert.latest_diff)) === null || _a === void 0 ? void 0 : _a.dictionary_item_added;
        return (React.createElement(React.Fragment, null, (data === null || data === void 0 ? void 0 : data.length) > 0 ? (React.createElement(React.Fragment, null,
            React.createElement("h6", null, "Literature:"),
            data.map((d, i) => React.createElement("p", { key: i }, d)),
            React.createElement("button", { title: "Confirm changes", className: "btn btn-secondary", onClick: () => confirmChanges(selectedAlert.id) },
                React.createElement("i", { className: "far fa-eye" }),
                " Confirm"))) : (React.createElement("p", null, "No new data available"))));
    };
    const editButton = !editMode && !deleteMode ? (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Edit Alert", className: "btn btn-text-secondary", onClick: () => setEditMode(true) },
            React.createElement("i", { className: "fas fa-pencil-alt" })),
        React.createElement("button", { title: "Delete Alert", className: "btn btn-text-secondary", onClick: () => setDeleteMode(true) },
            React.createElement("i", { className: "fas fa-trash" })))) : (editMode ? React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: () => onSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: () => onDiscard() },
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
            !editMode ? accordionItem(1, `${((_a = JSON.parse(selectedAlert.latest_diff)) === null || _a === void 0 ? void 0 : _a.dictionary_item_added) ? 'Latest revision from: ' + ((_b = new Date(selectedAlert.latest_compare_date)) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) : 'No new data'}`, 'editAlert', literature(), true) : null,
            accordionItem(2, 'Alert overview', 'editAlert', generalInformation, editMode))));
}
//# sourceMappingURL=CDCEditAlert.js.map