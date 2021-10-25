import React from "react";
import Select from 'react-select';
import { accordionItem } from ".";
import { saveAlert } from "./api";
import { CDCFilterComponent } from "./CDCFilterComponent";
import { getTreeQuery } from "./interface";
export function CDCCreateAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, setCreationMode, setSelectedAlert, cdcs }) {
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "Name"),
            React.createElement("input", { type: "text", className: "form-control", value: alertData.name, onChange: (e) => setAlertData({ ...alertData, name: e.target.value }) })),
        React.createElement("div", { className: "mb-3" },
            React.createElement("label", { className: "form-label" }, "CDC"),
            React.createElement(Select, { options: cdcs.map(c => { return { label: c, value: c }; }), value: { label: alertData.cdc_id, value: alertData.cdc_id }, onChange: e => setAlertData({ ...alertData, cdc_id: e.value }) })),
        React.createElement("input", { className: "form-check-input", type: "checkbox", checked: alertData.enable_mail_notification, onChange: (e) => setAlertData({ ...alertData, enable_mail_notification: e.target.checked }) }),
        React.createElement("label", { className: "form-check-label ms-2" }, "Email notification"),
        React.createElement("div", { className: "mb-3 form-check" })));
    const onSave = async () => {
        const newAlert = await saveAlert({ ...alertData, filter_dump: JSON.stringify(filter), filter_query: getTreeQuery(filter, filterComponents) });
        setAlertList([newAlert, ...alertList]);
        setSelectedAlert(newAlert);
        setCreationMode(false);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "d-flex w-100 justify-content-between mb-1" },
            React.createElement("h5", null, "Create alert"),
            React.createElement("small", null,
                React.createElement("button", { title: "Save changes", className: "btn btn-text-secondary", onClick: () => onSave() },
                    React.createElement("i", { className: "fas fa-save" })),
                React.createElement("button", { title: "Discard changes", className: "btn btn-text-secondary ms-1", onClick: () => setCreationMode(false) },
                    React.createElement("i", { className: "fas fa-ban" })))),
        React.createElement("div", { className: "accordion", id: "createAlert" },
            accordionItem(1, 'Alert overview', 'createAlert', generalInformation, true),
            accordionItem(2, 'Filter settings', 'createAlert', filterSelection ? (!filter ? null : React.createElement(CDCFilterComponent, { filterSelection: filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter })) : React.createElement("p", null, "No filters available for this cdc")))));
}
//# sourceMappingURL=CDCCreateAlert.js.map