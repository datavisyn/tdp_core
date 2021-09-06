import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { correlationTypes, distributionTypes, highDimensionalTypes } from './CustomVis';
import Plotly from "plotly.js";
import { useCallback, useState } from "react";
import { useResizeDetector } from "react-resize-detector";
import Select from "react-select";
export function MultiplesSidePanel(props) {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const onResize = useCallback(() => {
        // window.dispatchEvent(new Event('resize'));
        if (document.getElementById("plotlyDiv")) {
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
    const selectNumOptions = props.columns.filter(c => c.type === "number").map(c => {
        return {
            value: c.name,
            label: c.name
        };
    });
    const selectCatOptions = props.columns.filter(c => c.type === "categorical").map(c => {
        return {
            value: c.name,
            label: c.name
        };
    });
    return (React.createElement("div", { ref: ref, className: "position-relative h-100 flex-shrink-1 bg-light" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement(FontAwesomeIcon, { icon: faBars })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
            React.createElement("div", { className: "container", style: { width: "20rem" } },
                React.createElement("div", { className: "row", id: "home", role: "tabpanel", "aria-labelledby": "home-tab" },
                    React.createElement("label", { className: "px-2 pt-2" }, "Correlations"),
                    React.createElement("div", { className: "btn-group w-100 px-2 pt-1", role: "group", "aria-label": "Basic checkbox toggle button group" }, correlationTypes.map(d => {
                        return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                            React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                            React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                    }))),
                React.createElement("div", { className: "row", id: "profile", role: "tabpanel", "aria-labelledby": "profile-tab" },
                    React.createElement("label", { className: "px-2 pt-2" }, "Comparisons"),
                    React.createElement("div", { className: "btn-group w-100 px-2 pt-1", role: "group", "aria-label": "Basic checkbox toggle button group" }, distributionTypes.map(d => {
                        return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                            React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                            React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                    }))),
                React.createElement("div", { className: "row", id: "contact", role: "tabpanel", "aria-labelledby": "contact-tab" },
                    React.createElement("label", { className: "px-2 pt-2" }, "High Dimensional"),
                    React.createElement("div", { className: "btn-group w-100 px-2 pt-1 pb-2", role: "group", "aria-label": "Basic checkbox toggle button group" }, highDimensionalTypes.map(d => {
                        return (React.createElement(React.Fragment, { key: `correlationLabel${d}` },
                            React.createElement("input", { checked: props.currentVis === d, onChange: e => props.setCurrentVis(e.currentTarget.value), value: d, type: "checkbox", className: "btn-check", id: `btnCheck${d}`, autoComplete: "off" }),
                            React.createElement("label", { className: "btn btn-outline-primary", htmlFor: `btnCheck${d}` }, d)));
                    }))),
                React.createElement("hr", null),
                React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
                React.createElement(Select, { isMulti: true, onChange: e => props.updateSelectedNumCols(e.map(c => c.value)), name: "numColumns", options: selectNumOptions, value: selectNumOptions.filter(c => props.selectedNumCols.includes(c.value)) }),
                React.createElement("label", { className: "pt-2 pb-1" }, "Categorical Columns"),
                React.createElement(Select, { isMulti: true, onChange: e => props.updateSelectedCatCols(e.map(c => c.value)), name: "catColumns", options: selectCatOptions, value: selectCatOptions.filter(c => props.selectedCatCols.includes(c.value)) }),
                React.createElement("hr", null),
                React.createElement("div", null,
                    React.createElement("button", { className: "btn btn-primary-outline w-100", id: "advancedButton", onClick: e => setAdvancedOpen(!advancedOpen), type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#advancedOptions", "aria-expanded": "false", "aria-controls": "advancedOptions" },
                        React.createElement("label", { className: "pb-1 pe-2" }, "Advanced"),
                        React.createElement(FontAwesomeIcon, { icon: advancedOpen ? faCaretUp : faCaretDown })),
                    React.createElement("div", { className: "collapse", id: "advancedOptions" }, props.dropdowns.map((d, i) => {
                        return (React.createElement(React.Fragment, { key: `reactSelect${d.name}` },
                            React.createElement("label", { className: "pt-2 pb-1" }, d.name),
                            React.createElement(Select, { isClearable: true, onChange: e => d.callback(e ? e.value : ""), name: d.name, options: d.options.map(s => {
                                    return {
                                        value: s,
                                        label: s
                                    };
                                }), value: d.currentSelected ? { label: d.currentSelected, value: d.currentSelected } : [] })));
                    })))))));
}
//# sourceMappingURL=MultiplesSidePanel.js.map