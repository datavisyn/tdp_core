import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
let chartTypes = ["Scatterplot", "PCP", "Violin", "Strip Plot", "Multiples"];
export function GenericSidePanel(props) {
    return (React.createElement("div", { className: "position-relative h-100 bg-light" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement(FontAwesomeIcon, { icon: faBars })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
            React.createElement("div", { className: "container", style: { width: "15em" } },
                React.createElement("form", null,
                    React.createElement("div", { className: "form-group row pt-2 pb-4 pe-3 ps-3" },
                        React.createElement("label", { className: "fw-light px-0 pb-1 form-label fs-6" }, "Chart Type"),
                        React.createElement("select", { className: "form-select text-muted", defaultValue: props.currentType, "aria-label": "Default select example", onChange: evt => props.chartTypeChangeCallback(evt.currentTarget.value) }, chartTypes.map(c => {
                            return React.createElement("option", { value: c, key: c }, c);
                        }))),
                    React.createElement("hr", null),
                    props.dropdowns.map((d, i) => {
                        return (React.createElement("div", { key: d.name, className: "form-group row pt-4 pb-2 px-3" },
                            React.createElement("label", { className: "fw-light px-0 pb-1 form-label fs-6" }, d.name),
                            React.createElement("select", { className: "form-select text-muted", defaultValue: d.currentSelected, "aria-label": "Default select example", onChange: evt => d.callback(evt.currentTarget.value) }, d.options.map((c) => {
                                return React.createElement("option", { value: c, key: c }, c);
                            }))));
                    }))))));
}
//# sourceMappingURL=GenericSidePanel.js.map