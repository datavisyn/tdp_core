import * as React from 'react';
import { allVisTypes, EColumnTypes, EGeneralFormType } from '../types/generalTypes';
import Plotly from 'plotly.js';
import { useCallback, useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import Select from 'react-select';
import Highlighter from 'react-highlight-words';
import { NumericalColorChooser } from './NumericalColorChooser';
export function GeneralSidePanel(props) {
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
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);
    const selectCatOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
    }, [props.columns.length]);
    const formatOptionLabel = (option, ctx) => {
        return (React.createElement(React.Fragment, null,
            React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.name }),
            option.description &&
                React.createElement("span", { className: "small text-muted ms-1" }, option.description)));
    };
    return (React.createElement("div", { ref: ref, className: "position-relative h-100 flex-shrink-1 bg-light" },
        React.createElement("button", { className: "btn btn-primary-outline", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#generalVisBurgerMenu", "aria-expanded": "true", "aria-controls": "generalVisBurgerMenu" },
            React.createElement("i", { className: "fas fa-bars" })),
        React.createElement("div", { className: "collapse show collapse-horizontal", id: "generalVisBurgerMenu" },
            React.createElement("div", { className: "container", style: { width: '20rem' } },
                React.createElement("label", { className: "pt-2 pb-1" }, "Visualization Type"),
                React.createElement(Select, { closeMenuOnSelect: true, 
                    // components={{Option: optionLayout}}
                    onChange: (e) => props.setCurrentVis(e.value), name: "visTypes", options: allVisTypes.map((t) => {
                        return {
                            value: t,
                            label: t
                        };
                    }), value: { value: props.currentVis, label: props.currentVis } }),
                React.createElement("hr", null),
                React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
                React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => props.updateSelectedNumCols(e.map((c) => c)), name: "numColumns", options: selectNumOptions, value: selectNumOptions.filter((c) => props.selectedNumCols.filter((d) => d.id === c.id).length > 0) }),
                React.createElement("label", { className: "pt-2 pb-1" }, "Categorical Columns"),
                React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => props.updateSelectedCatCols(e.map((c) => c)), name: "catColumns", options: selectCatOptions, value: selectCatOptions.filter((c) => props.selectedCatCols.filter((d) => d.id === c.id).length > 0) }),
                React.createElement("hr", null),
                React.createElement("div", null,
                    props.dropdowns.filter((d) => d.type === EGeneralFormType.DROPDOWN).map((d, i) => {
                        return (React.createElement(React.Fragment, { key: `reactSelect${d.name}` },
                            React.createElement("label", { className: "pt-2 pb-1" }, d.name),
                            React.createElement(Select, { isClearable: true, onChange: (e) => d.callback(e), name: d.name, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: d.options, value: d.currentColumn ? d.currentColumn.info : [] })));
                    }),
                    props.dropdowns.filter((d) => d.type === EGeneralFormType.BUTTON).map((d, i) => {
                        if (d.name === 'Numerical Color Scale Type') {
                            return React.createElement(NumericalColorChooser, { key: 'numericalColorChooser', callback: d.callback, currentSelected: d.currentSelected, disabled: d.disabled });
                        }
                        return (React.createElement("div", { key: `buttonGroup${d.name}`, className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, d.options.map(((opt) => {
                            return (React.createElement(React.Fragment, { key: `radioButtons${d.name + opt}` },
                                React.createElement("input", { checked: d.currentSelected === opt, onChange: (e) => d.callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
                                React.createElement("label", { style: { zIndex: 0 }, className: `btn btn-outline-primary w-100 ${d.disabled ? 'disabled' : ''}`, htmlFor: `formButton${opt}` }, opt)));
                        }))));
                    }),
                    props.dropdowns.filter((d) => d.type === EGeneralFormType.SLIDER).map((d, i) => {
                        return (React.createElement("div", { key: `sliderDiv${d.name}`, className: "w-100 px-2 pt-3" },
                            React.createElement("input", { type: "range", onChange: (e) => d.callback(e.currentTarget.value), className: "form-range", min: "=0", max: "1", step: ".1", id: `sliderInput${d.name}` }),
                            React.createElement("label", { htmlFor: `sliderInput${d.name}`, className: `form-label ${d.disabled ? 'disabled' : ''}` }, d.name)));
                    }))))));
}
//# sourceMappingURL=GeneralSidePanel.js.map