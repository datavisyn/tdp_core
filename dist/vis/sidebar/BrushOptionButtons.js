import * as React from 'react';
export function BrushOptionButtons({ callback, isRectBrush }) {
    return (React.createElement("div", { className: "btn-group", role: "group" },
        React.createElement("input", { checked: isRectBrush, onChange: () => callback(true), type: "checkbox", className: "btn-check", id: "rectBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "rectBrushSelection", title: "Rectangular Brush" },
            React.createElement("i", { className: "far fa-square" })),
        React.createElement("input", { checked: !isRectBrush, onChange: () => callback(false), type: "checkbox", className: "btn-check", id: "lassoBrushSelection", autoComplete: "off" }),
        React.createElement("label", { className: "btn btn-outline-primary", htmlFor: "lassoBrushSelection", title: "Lasso Brush" },
            React.createElement("i", { className: "fas fa-paint-brush" }))));
}
//# sourceMappingURL=BrushOptionButtons.js.map