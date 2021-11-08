import React from 'react';
import Select from 'react-select';
import { accordionItem, runAlert } from '.';
import { confirmAlertById, deleteAlert, editAlert } from './api';
import { CDCFilterComponent } from './CDCFilterComponent';
import { getTreeQuery } from './interface';
export function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs }) {
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
        var _a, _b, _c, _d, _e;
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
                        React.createElement("tr", null,
                            React.createElement("th", { scope: "col" }, "#"),
                            React.createElement("th", { scope: "col" }, "Name"),
                            React.createElement("th", { scope: "col" }, "Street"),
                            React.createElement("th", { scope: "col" }, "City"))),
                    React.createElement("tbody", null, (_c = selectedAlert.latest_diff.dictionary_item_added) === null || _c === void 0 ? void 0 :
                        _c.map((d) => {
                            var _a, _b;
                            const data = selectedAlert.latest_fetched_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-success" },
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.id),
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.name),
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.address.street),
                                React.createElement("td", null, `${(_a = data === null || data === void 0 ? void 0 : data.address) === null || _a === void 0 ? void 0 : _a.zipcode} ${(_b = data === null || data === void 0 ? void 0 : data.address) === null || _b === void 0 ? void 0 : _b.city}`)));
                        }), (_d = selectedAlert.latest_diff.dictionary_item_removed) === null || _d === void 0 ? void 0 :
                        _d.map((d) => {
                            var _a, _b;
                            const data = selectedAlert.confirmed_data.find(a => a.id === d);
                            return (React.createElement("tr", { key: d, className: "table-danger" },
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.id),
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.name),
                                React.createElement("td", null, data === null || data === void 0 ? void 0 : data.address.street),
                                React.createElement("td", null, `${(_a = data === null || data === void 0 ? void 0 : data.address) === null || _a === void 0 ? void 0 : _a.zipcode} ${(_b = data === null || data === void 0 ? void 0 : data.address) === null || _b === void 0 ? void 0 : _b.city}`)));
                        }), (_e = [...change.keys()]) === null || _e === void 0 ? void 0 :
                        _e.map((id, i) => {
                            var _a, _b, _c, _d;
                            const oldData = (_a = selectedAlert.confirmed_data) === null || _a === void 0 ? void 0 : _a.find(a => a.id === id);
                            const newData = (_b = selectedAlert.latest_fetched_data) === null || _b === void 0 ? void 0 : _b.find(a => a.id === id);
                            return (React.createElement("tr", { key: i, className: "table-primary" },
                                change.get(id).has('id') ? React.createElement("td", null,
                                    React.createElement("s", null, change.get(id).get('id').old),
                                    " ",
                                    change.get(id).get('id').new) : React.createElement("td", null, oldData.id),
                                change.get(id).has('name') ? React.createElement("td", null,
                                    React.createElement("s", null, change.get(id).get('name').old),
                                    " ",
                                    change.get(id).get('name').new) : React.createElement("td", null, oldData.name),
                                change.get(id).has('address.street') ? React.createElement("td", null,
                                    React.createElement("s", null, change.get(id).get('address.street').old),
                                    " ",
                                    change.get(id).get('address.street').new) : React.createElement("td", null, oldData.address.street),
                                change.get(id).has('address.zipcode') ?
                                    React.createElement("td", null,
                                        React.createElement("s", null,
                                            change.get(id).get('address.zipcode').old,
                                            " ",
                                            oldData.address.city),
                                        " ",
                                        change.get(id).get('address.zipcode').new,
                                        " ",
                                        newData.address.city)
                                    : change.get(id).has('address.city') ?
                                        React.createElement("td", null,
                                            React.createElement("s", null,
                                                oldData.address.zipcode,
                                                " ",
                                                change.get(id).get('address.city').old),
                                            " ",
                                            newData.address.zipcode,
                                            " ",
                                            change.get(id).get('address.city').new)
                                        :
                                            React.createElement("td", null, `${(_c = oldData.address) === null || _c === void 0 ? void 0 : _c.zipcode} ${(_d = oldData.address) === null || _d === void 0 ? void 0 : _d.city}`)));
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