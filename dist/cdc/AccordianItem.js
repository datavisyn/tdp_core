import React from "react";
export default function AccordionItem({ children, index, title, parentId, show }) {
    // index: number, title: string, parentId: string, , show?: boolean
    console.log(this);
    return (React.createElement("div", { className: "accordion-item" },
        React.createElement("h2", { className: "accordion-header", id: `heading${index}` },
            React.createElement("button", { className: "accordion-button", type: "button", "data-bs-toggle": "collapse", "data-bs-target": `#collapse${index}`, "aria-expanded": "true", "aria-controls": `collapse${index}` }, title)),
        React.createElement("div", { id: `collapse${index}`, className: `p-2 accordion-collapse collapse${show ? " show" : ""}`, "aria-labelledby": `heading${index}`, "data-bs-parent": `#${parentId.trim()}` }, children)));
}
//# sourceMappingURL=AccordianItem.js.map