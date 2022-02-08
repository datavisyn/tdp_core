import * as React from 'react';
import { ENumericalColorScaleType } from '../interfaces';
export function NumericalColorButtons({ callback, currentSelected }) {
    const sequentialColors = ['#002245', '#214066', '#3e618a', '#5c84af', '#83a8c9', '#a9cfe4', '#cff6ff'];
    const divergentColors = ['#337ab7', '#7496c1', '#a5b4ca', '#d3d3d3', '#e5b19d', '#ec8e6a', '#ec6836'];
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { key: "numericalColorChooserRadio", className: "btn-group w-100 px-2 pt-2", role: "group", "aria-label": "Basic outlined example" },
            React.createElement("input", { checked: currentSelected === ENumericalColorScaleType.SEQUENTIAL, onChange: (e) => callback(e.currentTarget.value), value: ENumericalColorScaleType.SEQUENTIAL, type: "checkbox", className: "btn-check", id: `formButton${ENumericalColorScaleType.SEQUENTIAL}`, autoComplete: "off" }),
            React.createElement("label", { style: { zIndex: 0 }, className: "btn btn-outline-primary w-100", htmlFor: `formButton${ENumericalColorScaleType.SEQUENTIAL}`, title: "Sequential Color Scale" }, ENumericalColorScaleType.SEQUENTIAL),
            React.createElement("input", { checked: currentSelected === ENumericalColorScaleType.DIVERGENT, onChange: (e) => callback(e.currentTarget.value), value: ENumericalColorScaleType.DIVERGENT, type: "checkbox", className: "btn-check", id: `formButton${ENumericalColorScaleType.DIVERGENT}`, autoComplete: "off" }),
            React.createElement("label", { style: { zIndex: 0 }, className: "btn btn-outline-primary w-100", htmlFor: `formButton${ENumericalColorScaleType.DIVERGENT}`, title: "Divergent Color Scale" }, ENumericalColorScaleType.DIVERGENT)),
        React.createElement("div", { className: "d-flex w-100 px-2 pt-1 pb-3" },
            React.createElement("div", { className: "d-flex w-100 mx-2" }, sequentialColors.map((d) => {
                return React.createElement("span", { key: `colorScale ${d}`, className: "w-100", style: { border: '1px solid lightgrey', background: `${d}`, height: '1rem' } });
            })),
            React.createElement("div", { className: "d-flex w-100 mx-2" }, divergentColors.map((d) => {
                return React.createElement("span", { key: `colorScale ${d}`, className: "w-100", style: { border: '1px solid lightgrey', background: `${d}`, height: '1rem' } });
            })))));
}
//# sourceMappingURL=NumericalColorButtons.js.map