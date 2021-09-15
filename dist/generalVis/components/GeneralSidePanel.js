import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { allVisTypes, EColumnTypes, EGeneralFormType } from '../types/generalTypes';
import Plotly from 'plotly.js';
import { useCallback, useMemo, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import Select from 'react-select';
export function GeneralSidePanel(props) {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    // GOTTA BE A BETTER WAY
    const onResize = useCallback(() => {
        if (document.getElementById('plotlyDiv')) {
            Plotly.relayout('plotlyDiv', {
                autosize: true,
                transition: {
                    duration: 1000,
                    easing: 'cubic-in'
                }
            });
        }
    }, []);
    const { ref } = useResizeDetector({ onResize });
    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => {
            return {
                value: c.name,
                label: c.name
            };
        });
    }, [props.columns.length]);
    const selectCatOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => {
            return {
                value: c.name,
                label: c.name
            };
        });
    }, [props.columns.length]);
    return (React.createElement("div", { ref: ref, className: "position-relative h-100 flex-shrink-1 bg-light" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement(FontAwesomeIcon, { icon: faBars })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
            React.createElement("div", { className: "container", style: { width: '20rem' } },
                React.createElement("label", { className: "pt-2 pb-1" }, "Visualization Type"),
                React.createElement(Select, { closeMenuOnSelect: true, onChange: (e) => props.setCurrentVis(e.value), name: "visTypes", options: allVisTypes.map((t) => {
                        return {
                            value: t,
                            label: t
                        };
                    }), value: { value: props.currentVis, label: props.currentVis } }),
                React.createElement("hr", null),
                React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
                React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, onChange: (e) => props.updateSelectedNumCols(e.map((c) => c.value)), name: "numColumns", options: selectNumOptions, value: selectNumOptions.filter((c) => props.selectedNumCols.includes(c.value)) }),
                React.createElement("label", { className: "pt-2 pb-1" }, "Categorical Columns"),
                React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, onChange: (e) => props.updateSelectedCatCols(e.map((c) => c.value)), name: "catColumns", options: selectCatOptions, value: selectCatOptions.filter((c) => props.selectedCatCols.includes(c.value)) }),
                React.createElement("hr", null),
                React.createElement("div", null,
                    props.dropdowns.filter((d) => d.type === EGeneralFormType.DROPDOWN).map((d, i) => {
                        return (React.createElement(React.Fragment, { key: `reactSelect${d.name}` },
                            React.createElement("label", { className: "pt-2 pb-1" }, d.name),
                            React.createElement(Select, { isClearable: true, onChange: (e) => d.callback(e ? e.value : ''), name: d.name, options: d.options.map((s) => {
                                    return {
                                        value: s,
                                        label: s
                                    };
                                }), value: d.currentColumn ? { label: d.currentColumn.name, value: d.currentColumn.name } : [] })));
                    }),
                    props.dropdowns.filter((d) => d.type === EGeneralFormType.BUTTON).map((d, i) => {
                        return (React.createElement("div", { key: `dropdownDiv${d.name}`, className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, d.options.map(((opt) => {
                            return (React.createElement(React.Fragment, { key: `radioButtons${d.name + opt}` },
                                React.createElement("input", { checked: d.currentSelected === opt, onChange: (e) => d.callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
                                React.createElement("label", { style: { zIndex: 0 }, className: `btn btn-outline-primary w-100 ${d.disabled ? 'disabled' : ''}`, htmlFor: `formButton${opt}` }, opt)));
                        }))));
                    }))))));
}
//# sourceMappingURL=GeneralSidePanel.js.map