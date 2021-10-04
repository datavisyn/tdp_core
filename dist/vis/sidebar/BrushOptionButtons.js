import * as React from 'react';
import { EBarDirection } from '../bar/utils';
export function BrushOptionButtons(props) {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "btn-group", role: "group" },
            React.createElement("input", { checked: props.isRectBrush, onChange: (e) => props.callback(true), type: "checkbox", className: "btn-check", id: `rectBrushSelection`, autoComplete: "off" }),
            React.createElement("label", { className: `btn btn-outline-primary`, htmlFor: `rectBrushSelection`, title: "Rectangular Brush" },
                React.createElement("i", { className: "far fa-square" })),
            React.createElement("input", { checked: !props.isRectBrush, onChange: (e) => props.callback(false), type: "checkbox", className: "btn-check", id: `lassoBrushSelection`, autoComplete: "off" }),
            React.createElement("label", { className: `btn btn-outline-primary`, htmlFor: `lassoBrushSelection`, title: "Lasso Brush" },
                React.createElement("i", { className: "fas fa-paint-brush" })))));
}
//# sourceMappingURL=BrushOptionButtons.js.map