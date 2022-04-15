import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';
export function HexBrushOptions({ callback, dragMode }) {
    return (React.createElement("div", { className: "btn-group", role: "group" },
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.RECTANGLE, onChange: () => callback(EScatterSelectSettings.RECTANGLE), type: "checkbox", className: "btn-check", id: "rectBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "rectBrushSelection", title: "Rectangular Brush" },
            React.createElement("i", { className: "fas fa-paint-brush" })),
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.PAN, onChange: () => callback(EScatterSelectSettings.PAN), type: "checkbox", className: "btn-check", id: "lassoBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "lassoBrushSelection", title: "Lasso Brush" },
            React.createElement("i", { className: "fas fa-arrows-alt" }))));
}
//# sourceMappingURL=HexBrushOptions.js.map