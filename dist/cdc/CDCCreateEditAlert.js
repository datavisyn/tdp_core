import React from "react";
import { CDCFilterComponent } from "./CDCFilterComponent";
import { v4 as uuidv4 } from 'uuid';
export function CDCCreateEditAlert({ formData, setFormData, filterSelection, selectedAlert, filter, setFilter, editMode, setEditMode, filterComponents }) {
    const generalInformation = formData ?
        (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "mb-3" },
                React.createElement("label", { className: "form-label" }, "Name"),
                selectedAlert && !editMode ?
                    React.createElement("p", null, formData.name)
                    :
                        React.createElement("input", { type: "text", className: "form-control", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) })),
            React.createElement("div", { className: "mb-3" },
                React.createElement("label", { className: "form-label" }, "CDC"),
                selectedAlert && !editMode ?
                    React.createElement("p", null, formData.name)
                    :
                        React.createElement("input", { type: "text", className: "form-control", value: formData.cdc_id, onChange: (e) => setFormData({ ...formData, cdc_id: e.target.value }) })),
            React.createElement("input", { className: "form-check-input", type: "checkbox", disabled: selectedAlert && !editMode, checked: formData.enable_mail_notification, onChange: (e) => setFormData({ ...formData, enable_mail_notification: e.target.checked }) }),
            React.createElement("label", { className: "form-check-label ms-2" }, "Email notification"),
            React.createElement("div", { className: "mb-3 form-check" }))) : null;
    const accordionItem = (title, parentId, child, show) => {
        const index = uuidv4();
        parentId = parentId.trim();
        return (React.createElement("div", { key: index, className: "accordion-item" },
            React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
                React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
            React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse${show ? " show" : ""}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId}` }, child)));
    };
    return (React.createElement("div", { className: "accordion", id: "createAlert" },
        accordionItem('Alert overview', 'createAlert', generalInformation, true),
        selectedAlert ? accordionItem('New literature', 'createAlert', React.createElement("p", null, "text aufgeklappt")) : null,
        accordionItem('Filter settings', 'createAlert', !filter ? null : React.createElement(CDCFilterComponent, { filterSelection: selectedAlert && !editMode ? null : filterSelection, filterComponents: filterComponents, filter: filter, setFilter: setFilter }))));
}
//# sourceMappingURL=CDCCreateEditAlert.js.map