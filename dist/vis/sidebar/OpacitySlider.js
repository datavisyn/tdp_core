import * as React from 'react';
export function OpacitySlider({ callback, currentValue }) {
    return (React.createElement("div", { className: "ps-2 pt-0 m-0" },
        React.createElement("label", { htmlFor: "alphaSlider", className: "form-label m-0 p-0" }, "Opacity"),
        React.createElement("input", { type: "range", onChange: (e) => callback(+e.currentTarget.value), className: "form-range", value: currentValue, min: "=0", max: "1", step: ".1", id: "alphaSlider" })));
}
//# sourceMappingURL=OpacitySlider.js.map