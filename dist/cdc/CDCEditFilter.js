import React from "react";
import { CDCFilterComponent } from "./CDCFilterComponent";
export function CDCEditFilter({ selectedAlert }) {
    const accordionItem = (parentId, title, index, innerHtml, show) => {
        return (React.createElement("div", { className: "accordion-item" },
            React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
                React.createElement("button", { disabled: !selectedAlert, className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
            React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse ${show}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId}` }, innerHtml)));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("h5", null, "Your options"),
        React.createElement("div", { className: "accordion", id: "filterOptions" },
            accordionItem('filterOptions', 'Alert overview', 1, (React.createElement(React.Fragment, null,
                React.createElement("p", null, "text aufgeklappt"),
                React.createElement("p", null, "is"),
                React.createElement("p", null, "written"),
                React.createElement("p", null, "here"))), "show"),
            accordionItem('filterOptions', 'New Literature', 2, (React.createElement(React.Fragment, null,
                React.createElement("p", null, "text"),
                React.createElement("p", null, "is"),
                React.createElement("p", null, "written"),
                React.createElement("p", null, "here")))),
            accordionItem('filterOptions', 'Filter settings', 3, React.createElement(CDCFilterComponent, null)))));
}
//# sourceMappingURL=CDCEditFilter.js.map