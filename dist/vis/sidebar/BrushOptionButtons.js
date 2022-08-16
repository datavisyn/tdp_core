import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';
export function BrushOptionButtons({ callback, dragMode }) {
    return (React.createElement("div", { className: "btn-group", role: "group" },
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.RECTANGLE, onChange: () => callback(EScatterSelectSettings.RECTANGLE), type: "checkbox", className: "btn-check", id: "rectBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "rectBrushSelection", title: "Rectangular Brush" },
            React.createElement("i", { className: "far fa-square" })),
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.LASSO, onChange: () => callback(EScatterSelectSettings.LASSO), type: "checkbox", className: "btn-check", id: "lassoBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "lassoBrushSelection", title: "Lasso Brush" },
            React.createElement("i", { className: "fas fa-paint-brush" })),
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.ZOOM, onChange: () => callback(EScatterSelectSettings.ZOOM), type: "checkbox", className: "btn-check", id: "zoomBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "zoomBrushSelection", title: "Zoom" },
            React.createElement("i", { className: "fas fa-search-plus" })),
        React.createElement("input", { checked: dragMode === EScatterSelectSettings.PAN, onChange: () => callback(EScatterSelectSettings.PAN), type: "checkbox", className: "btn-check", id: "panSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "panSelection", title: "Pan" },
            React.createElement("i", { className: "fas fa-arrows-alt" }))));
}
//# sourceMappingURL=BrushOptionButtons.js.map