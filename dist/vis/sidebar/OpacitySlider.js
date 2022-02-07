import * as React from 'react';
import { EBarDirection } from '../bar/utils';
export function OpacitySlider(props) {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (React.createElement("div", { className: "ps-2 pt-0 m-0" },
        React.createElement("label", { htmlFor: "alphaSlider", className: "form-label m-0 p-0" }, "Opacity"),
        React.createElement("input", { type: "range", onChange: (e) => props.callback(+e.currentTarget.value), className: "form-range", value: props.currentValue, min: "=0", max: "1", step: ".1", id: "alphaSlider" })));
}
//# sourceMappingURL=OpacitySlider.js.map