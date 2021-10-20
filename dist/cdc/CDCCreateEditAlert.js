import React from "react";
import { AccordionView } from "./AccordionView";
import { CDCFilterComponent } from "./CDCFilterComponent";
export function CDCCreateEditAlert({ formData, setFormData, filterSelection, selectedAlert, filter, setFilter }) {
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("h6", null, "Name"),
        React.createElement("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }),
        React.createElement("h6", null, "Email notification"),
        React.createElement("input", { className: "form-check-input", type: "checkbox", checked: formData.enable_mail_notification, onChange: (e) => setFormData({ ...formData, enable_mail_notification: e.target.checked }) }),
        React.createElement("h6", null, "CDC"),
        React.createElement("input", { type: "text", value: formData.cdc_id, onChange: (e) => setFormData({ ...formData, cdc_id: e.target.value }) })));
    const data = selectedAlert ? [
        { title: 'Alert overview', JSX: generalInformation, show: true },
        { title: 'New literature', JSX: React.createElement("p", null, "text aufgeklappt") },
        { title: 'Filter settings', JSX: React.createElement(CDCFilterComponent, { filterSelection: filterSelection, filter: filter, setFilter: setFilter }) }
    ] : [
        { title: "General information", JSX: generalInformation, show: true },
        { title: "Edit filters", JSX: React.createElement(CDCFilterComponent, { filterSelection: filterSelection, filter: filter, setFilter: setFilter }) }
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("h5", null, "Your options"),
        React.createElement(AccordionView, { parentId: "createAlert", data: data })));
}
//# sourceMappingURL=CDCCreateEditAlert.js.map