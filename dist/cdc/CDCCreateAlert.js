import React from "react";
import { AccordionView } from "./AccordionView";
import { CDCFilterComponent } from "./CDCFilterComponent";
export function CDCCreateAlert() {
    const [alertName, setAlertName] = React.useState("");
    const generalInformation = (React.createElement(React.Fragment, null,
        React.createElement("h6", null, "Name"),
        React.createElement("input", { type: "text", value: alertName, onChange: (e) => setAlertName(e.target.value) })));
    const data = [
        { title: "General information", JSX: generalInformation, show: true },
        { title: "Edit filters", JSX: React.createElement(CDCFilterComponent, null) }
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("h5", null, "Your options"),
        React.createElement(AccordionView, { parentId: "createAlert", data: data })));
}
//# sourceMappingURL=CDCCreateAlert.js.map