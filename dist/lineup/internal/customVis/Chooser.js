import * as React from 'react';
import { chartTypes } from './CustomVis';
export function Chooser(props) {
    return (React.createElement("div", { className: "position-relative h-100 bg-light" },
        React.createElement("div", { className: "container", style: { width: "15em" } },
            React.createElement("div", { className: "form-group row pt-2 pb-4 pe-3 ps-3" },
                React.createElement("label", { className: "fw-light px-0 pb-1 form-label fs-6" }, "Chart Type"),
                React.createElement("select", { className: "form-select text-muted", "aria-label": "Default select example", onChange: evt => props.updateChartType(evt.currentTarget.value) },
                    React.createElement("option", { value: "None" }, "None"),
                    chartTypes.map(c => {
                        return React.createElement("option", { value: c, key: c }, c);
                    }))))));
}
//# sourceMappingURL=Chooser.js.map