import React from "react";
import Select from 'react-select';
import { accordionItem } from ".";
import { editAlert } from "./api";
import { CDCFilterComponent } from "./CDCFilterComponent";
import { getTreeQuery } from "./interface";
export function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, selectedAlert, setSelctedAlert, cdcs }) {
    const [editMode, setEditMode] = React.useState(false);
    React.useEffect(() => {
        setEditMode(false);
    }, [selectedAlert]);
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "Name"),
            !editMode ?
                React.createElement("p", null, alertData.name)
                :
                    React.createElement("input", { type: "text", className: "form-control", value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }) })),
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "CDC"),
            React.createElement(Select, { isDisabled: !editMode, options: cdcs.map(c => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: e => setAlertData({ ...alertData, cdc_id: e.value }) })),
        React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: !editMode, checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
        React.createElement("label", { className: "form-check-label ms-2" }, "Email notification"),
        React.createElement("div", { className: "mb-3 form-check" })));
    const literature = () => {
        var _a;
        const data = (_a = JSON.parse(selectedAlert.latest_diff)) === null || _a === void 0 ? void 0 : _a.dictionary_item_added;
        return (React.createElement(React.Fragment, null, (data === null || data === void 0 ? void 0 : data.length) > 0 ? (React.createElement(React.Fragment, null,
            React.createElement("h6", null, "New literature from:"),
            React.createElement("p", null, selectedAlert.latest_compare_date),
            React.createElement("h6", null, "Literature:"),
            data.map((d, i) => React.createElement("p", { key: i }, d)))) : (React.createElement("p", null, "No new literature available"))));
    };
    const onSave = async () => {
        const newAlert = await editAlert(selectedAlert.id, { ...alertData, filter_dump: JSON.stringify(filter), filter_query: getTreeQuery(filter, filterComponents) });
        setAlertList([newAlert, ...alertList.filter((alert) => alert.id !== selectedAlert.id)]);
        setSelctedAlert(newAlert);
        setEditMode(false);
    };
    const onDiscard = () => {
        setAlertData(selectedAlert);
        setFilter(JSON.parse(selectedAlert.filter_dump));
        setEditMode(false);
    };
    const editButton = !editMode ? (React.createElement("button", { className: "btn btn-text-secondary", onClick: () => setEditMode(true) },
        React.createElement("i", { className: "fas fa-pencil-alt" }))) : (React.createElement(React.Fragment, null,
        React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: () => onSave() },
            React.createElement("i", { className: "fas fa-save" })),
        React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: () => onDiscard() },
            React.createElement("i", { className: "fas fa-ban" }))));
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Your options"),
            React.createElement("small", null, editButton)),
        React.createElement("div", { className: "accordion", id: "createAlert" },
            accordionItem(1, 'New literature', 'createAlert', literature(), true),
            accordionItem(2, 'Alert overview', 'createAlert', generalInformation),
            accordionItem(3, 'Filter settings', 'createAlert', filterSelection ? (!filter ? null : React.createElement(CDCFilterComponent, { filterSelection: !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter, disableFilter: !editMode })) : React.createElement("p", null, "No filters available for this cdc")))));
}
//# sourceMappingURL=CDCEditAlert.js.map