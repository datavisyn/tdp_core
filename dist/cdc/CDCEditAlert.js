import React from 'react';
import Select from 'react-select';
import { runAlert } from '.';
import { confirmAlertById, deleteAlert, editAlert } from './api';
import { CDCFilterComponent } from './CDCFilterComponent';
import { getTreeQuery } from './interface';
export function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs, compareColumnOptions }) {
    var _a;
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
                filter,
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
        setFilter(selectedAlert.filter);
    };
    const onDelete = async (id) => {
        setEditMode(false);
        await deleteAlert(id);
        onAlertChanged();
    };
    const getNestedValue = (obj, key) => {
        const keys = key.split(".");
        let value = obj;
        keys.forEach((k) => {
            value = value[k];
        });
        return value;
    };
    const accordionItem = (index, title, parentId, child, show) => {
        parentId = parentId.trim();
        return (React.createElement("div", { key: index, className: "accordion-item" },
            React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
                React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
            React.createElement("div", { id: `collapse${index}`, className: `p-4 accordion-collapse collapse${show ? ' show' : ''}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId}` }, child)));
    };
    const generalInformation = React.createElement(React.Fragment, null,
        React.createElement("div", { className: "row mb-3" },
            React.createElement("div", { className: "mb-3 col" },
                React.createElement("label", { className: "form-label" }, "Name"),
                !editMode ?
                    React.createElement("h6", null, alertData.name)
                    :
                        React.createElement(React.Fragment, null,
                            React.createElement("input", { type: "text", className: `form-control${validName ? '' : ' is-invalid'}`, value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }) }),
                            validName ? null :
                                React.createElement("div", { className: "invalid-feedback" }, "Name must not be empty!"))),
            React.createElement("div", { className: "mb-3 col pe-2" },
                React.createElement("label", { className: "form-label" }, "CDC"),
                React.createElement(Select, { isDisabled: !editMode, options: cdcs.map((c) => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: (e) => setAlertData({ ...alertData, cdc_id: e.value }) })),
            React.createElement("div", { className: "mb-3 col pe-2" },
                React.createElement("label", { className: "form-label" }, "Change Fields"),
                React.createElement(Select, { isDisabled: !editMode, isMulti: true, closeMenuOnSelect: false, options: compareColumnOptions, value: alertData.compare_columns, onChange: (e) => setAlertData({ ...alertData, compare_columns: e }) })),
            React.createElement("div", { className: "mb-3 col" },
                React.createElement("label", { className: "form-label" }, "Email notification"),
                React.createElement("div", { className: "form-check" },
                    React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
                    React.createElement("label", { className: "form-check-label ms-2" }, "Send me an email")))),
        React.createElement("div", null, filterSelection || !filter ?
            React.createElement(CDCFilterComponent, { filterSelection: !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, disableFilter: !editMode, isInvalid: !validFilter })
            :
                React.createElement("p", null, "No filters available for this cdc")));
    const literature = () => {
        var _a, _b, _c, _d, _e, _f;
        if (selectedAlert.latest_diff) {
            const change = new Map();
            (_b = (_a = selectedAlert.latest_diff) === null || _a === void 0 ? void 0 : _a.values_changed) === null || _b === void 0 ? void 0 : _b.map((d) => {
                const nestedField = d.field.map((f) => f).join(".");
                if (change.has(d.id)) {
                    change.set(d.id, change.get(d.id).set(nestedField, { old: d.old_value, new: d.new_value }));
                }
                else {
                    change.set(d.id, new Map().set(nestedField, { old: d.old_value, new: d.new_value }));
                }
            });
            return (React.createElement(React.Fragment, null,
                React.createElement("h6", null, "Changed data:"),
                React.createElement("table", { className: "table table-light mt-2" },
                    React.createElement("thead", null,
                        React.createElement("tr", null, (_c = selectedAlert.compare_columns) === null || _c === void 0 ? void 0 : _c.map((field, i) => React.createElement("th", { key: `header-${i}`, scope: "col" }, field.label)))),
                    React.createElement("tbody", null, (_d = selectedAlert.latest_diff.dictionary_item_added) === null || _d === void 0 ? void 0 :
                        _d.map((d) => {
                            var _a;
                            const data = selectedAlert.latest_fetched_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-success" }, (_a = selectedAlert.compare_columns) === null || _a === void 0 ? void 0 : _a.map((field, i) => React.createElement("td", { key: `added-${i}` }, getNestedValue(data, field.value)))));
                        }), (_e = selectedAlert.latest_diff.dictionary_item_removed) === null || _e === void 0 ? void 0 :
                        _e.map((d) => {
                            var _a;
                            const data = selectedAlert.confirmed_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-danger" }, (_a = selectedAlert.compare_columns) === null || _a === void 0 ? void 0 : _a.map((field, i) => React.createElement("td", { key: `removed-${i}` }, getNestedValue(data, field.value)))));
                        }), (_f = [...change.keys()]) === null || _f === void 0 ? void 0 :
                        _f.map((id, i) => {
                            var _a, _b;
                            const oldData = (_a = selectedAlert.confirmed_data) === null || _a === void 0 ? void 0 : _a.find(a => a.id === id);
                            return (React.createElement("tr", { key: `tr-changed-${i}`, className: "table-primary" }, (_b = selectedAlert.compare_columns) === null || _b === void 0 ? void 0 : _b.map((field, index) => change.get(id).has(field.value) ? React.createElement("td", { key: `changed-${i}-${index}` },
                                React.createElement("s", null, change.get(id).get(field.value).old),
                                " ",
                                change.get(id).get(field.value).new) : React.createElement("td", { key: `changed-${i}-${index}` }, getNestedValue(oldData, field.value)))));
                        }))),
                React.createElement("div", { className: "d-md-flex justify-content-md-end" },
                    React.createElement("button", { title: "Confirm changes", className: "btn btn-primary", onClick: () => confirmChanges(selectedAlert.id) }, "Confirm"))));
        }
        return React.createElement("p", null, "No new data available");
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
            !editMode ? accordionItem(1, `${selectedAlert.latest_diff ? 'Latest revision from: ' + ((_a = new Date(selectedAlert.latest_compare_date)) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()) : 'No new data'}`, 'editAlert', literature(), true) : null,
            accordionItem(2, 'Alert overview', 'editAlert', generalInformation, editMode))));
}
//# sourceMappingURL=CDCEditAlert.js.map