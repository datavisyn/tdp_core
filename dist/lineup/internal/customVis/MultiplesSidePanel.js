import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { chartTypes, correlationTypes, distributionTypes, highDimensionalTypes } from './CustomVis';
import Plotly from "plotly.js";
import { useCallback } from "react";
import { useResizeDetector } from "react-resize-detector";
export function MultiplesSidePanel(props) {
    const onResize = useCallback(() => {
        // window.dispatchEvent(new Event('resize'));
        if (document.getElementById("plotlyDiv")) {
            console.log("in here");
            Plotly.relayout("plotlyDiv", {
                autosize: true,
                transition: {
                    duration: 1000,
                    easing: "cubic-in"
                }
            });
        }
    }, []);
    const { ref } = useResizeDetector({ onResize });
    return (React.createElement("div", { ref: ref, className: "position-relative h-100 flex-shrink-1 bg-light" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement(FontAwesomeIcon, { icon: faBars })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
            React.createElement("div", { className: "container", style: { width: "40em" } },
                React.createElement("form", null,
                    React.createElement("div", { className: "form-group row pt-2 pb-4 pe-3 ps-3" },
                        React.createElement("label", { className: "fw-light px-0 pb-1 form-label fs-6" }, "Chart Type"),
                        React.createElement("select", { className: "form-select text-muted", defaultValue: props.currentType, "aria-label": "Default select example", onChange: evt => props.chartTypeChangeCallback(evt.currentTarget.value) }, chartTypes.map(c => {
                            return React.createElement("option", { value: c, key: c }, c);
                        }))),
                    React.createElement("ul", { className: "nav nav-tabs", id: "myTab", role: "tablist" },
                        React.createElement("li", { className: "nav-item", role: "presentation" },
                            React.createElement("button", { className: "nav-link active", id: "home-tab", "data-bs-toggle": "tab", "data-bs-target": "#home", type: "button", role: "tab", "aria-controls": "home", "aria-selected": "true" }, "Correlation")),
                        React.createElement("li", { className: "nav-item", role: "presentation" },
                            React.createElement("button", { className: "nav-link", id: "profile-tab", "data-bs-toggle": "tab", "data-bs-target": "#profile", type: "button", role: "tab", "aria-controls": "profile", "aria-selected": "false" }, "Distribution")),
                        React.createElement("li", { className: "nav-item", role: "presentation" },
                            React.createElement("button", { className: "nav-link", id: "contact-tab", "data-bs-toggle": "tab", "data-bs-target": "#contact", type: "button", role: "tab", "aria-controls": "contact", "aria-selected": "false" }, "High Dimensional"))),
                    React.createElement("div", { className: "tab-content", id: "myTabContent" },
                        React.createElement("div", { className: "tab-pane fade show active", id: "home", role: "tabpanel", "aria-labelledby": "home-tab" },
                            React.createElement("div", { className: "btn-group px-2 pt-3", role: "group", "aria-label": "Basic checkbox toggle button group" }, correlationTypes.map(d => {
                                return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                                    React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                                    React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                            })),
                            React.createElement("hr", null)),
                        React.createElement("div", { className: "tab-pane fade", id: "profile", role: "tabpanel", "aria-labelledby": "profile-tab" },
                            React.createElement("div", { className: "btn-group px-2 pt-3", role: "group", "aria-label": "Basic checkbox toggle button group" }, distributionTypes.map(d => {
                                return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                                    React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                                    React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                            })),
                            React.createElement("hr", null)),
                        React.createElement("div", { className: "tab-pane fade", id: "contact", role: "tabpanel", "aria-labelledby": "contact-tab" },
                            React.createElement("div", { className: "btn-group px-2 pt-3", role: "group", "aria-label": "Basic checkbox toggle button group" }, highDimensionalTypes.map(d => {
                                return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                                    React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                                    React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                            })),
                            React.createElement("hr", null))),
                    React.createElement("label", { className: "fw-light px-3 pb-1 form-label fs-6 row" }, "Numerical Columns"),
                    React.createElement("div", { className: "btn-group px-2", role: "group", "aria-label": "Basic checkbox toggle button group" }, props.columns.filter(c => c.type === "Numerical").map(d => {
                        return (React.createElement(React.Fragment, { key: `btnLabel${d.name}` },
                            React.createElement("input", { checked: props.selectedNumCols.includes(d.name), onChange: e => props.updateSelectedNumCols(d.name, e.currentTarget.checked), value: d.name, type: "checkbox", className: "btn-check", id: `btnCheck${d.name}`, autoComplete: "off" }),
                            React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d.name}` }, d.name)));
                    })),
                    React.createElement("hr", null),
                    React.createElement("label", { className: "fw-light px-3 pb-1 form-label fs-6 row" }, "Categorical Columns"),
                    React.createElement("div", { className: "btn-group px-2 flex", role: "group", "aria-label": "Basic checkbox toggle button group" }, props.columns.filter(c => c.type === "Categorical").map(d => {
                        return (React.createElement(React.Fragment, { key: `btnLabel${d.name}` },
                            React.createElement("input", { checked: props.selectedCatCols.includes(d.name), onChange: e => props.updateSelectedCatCols(d.name, e.currentTarget.checked), value: d.name, type: "checkbox", className: "btn-check", id: `btnCheck${d.name}`, autoComplete: "off" }),
                            React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d.name}` }, d.name)));
                    })),
                    React.createElement("hr", null),
                    props.dropdowns.map((d, i) => {
                        return (React.createElement("div", { key: d.name, className: "form-group row pt-4 pb-2 px-3" },
                            React.createElement("label", { className: "fw-light px-0 pb-1 form-label fs-6" }, d.name),
                            React.createElement("select", { className: "form-select text-muted", defaultValue: d.currentSelected, "aria-label": "Default select example", onChange: evt => d.callback(evt.currentTarget.value) }, d.options.map((c) => {
                                return React.createElement("option", { value: c, key: c }, c);
                            }))));
                    }))))));
}
//# sourceMappingURL=MultiplesSidePanel.js.map