import React from "react";
import { AccordionView } from "./AccordionView";
import { CDCFilterComponent } from "./CDCFilterComponent";
export function CDCEditAlert({ selectedAlert }) {
    const data = [
        { title: 'Alert overview', JSX: React.createElement("p", null, "text aufgeklappt"), show: true },
        { title: 'New literature', JSX: React.createElement("p", null, "text aufgeklappt") },
        { title: 'Filter settings', JSX: React.createElement(CDCFilterComponent, null) }
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("h5", null, "Your options"),
        React.createElement(AccordionView, { parentId: "filterOptions", data: data })));
}
//# sourceMappingURL=CDCEditAlert.js.map