import * as React from 'react';
export function HexSizeSlider({ callback, currentValue }) {
    return (React.createElement("div", { className: "ps-2 pt-1 m-0" },
        React.createElement("label", { htmlFor: "alphaSlider", className: "form-label m-0 p-0" }, "Hex Size"),
        React.createElement("input", { type: "range", onChange: (e) => callback(+e.currentTarget.value), className: "form-range", value: currentValue, min: "3", max: "30", step: "1", id: "alphaSlider" })));
}
//# sourceMappingURL=HexSizeSlider.js.map