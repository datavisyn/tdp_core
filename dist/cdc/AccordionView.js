import React from "react";
export function AccordionView({ parentId, data }) {
    const accordionItem = (index, title, JSX, show) => {
        return (React.createElement("div", { key: index, className: "accordion-item" },
            React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
                React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
            React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse${show ? " show" : ""}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId.trim()}` }, JSX)));
    };
    return (React.createElement("div", { className: "accordion", id: parentId.trim() }, data.map((d, i) => accordionItem(i, d.title, d.JSX, d.show))));
}
//# sourceMappingURL=AccordionView.js.map