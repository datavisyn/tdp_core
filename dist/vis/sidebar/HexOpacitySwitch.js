import * as React from 'react';
export function HexOpacitySwitch({ callback, currentValue }) {
    return (React.createElement("div", { className: "ps-2 pt-1 m-0" },
        React.createElement("div", { className: "form-check form-switch" },
            React.createElement("input", { onChange: () => callback(!currentValue), checked: currentValue, className: "form-check-input", type: "checkbox", id: "hexOpacitySwitch" }),
            React.createElement("label", { className: "form-check-label", htmlFor: "hexOpacitySwitch" }, "Hex Opacity Scale"))));
}
//# sourceMappingURL=HexOpacitySwitch.js.map