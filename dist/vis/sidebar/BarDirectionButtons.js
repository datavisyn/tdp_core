import * as React from 'react';
import { EBarDirection } from '../interfaces';
export function BarDirectionButtons({ callback, currentSelected }) {
    const options = [EBarDirection.VERTICAL, EBarDirection.HORIZONTAL];
    return (React.createElement("div", { key: "barDirectionGroup", className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, options.map((opt) => {
        return (React.createElement(React.Fragment, { key: `radioButtonsFilter${opt}` },
            React.createElement("input", { checked: currentSelected === opt, onChange: (e) => callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
            React.createElement("label", { style: { zIndex: 0 }, className: "btn btn-outline-primary w-100", htmlFor: `formButton${opt}` }, opt)));
    })));
}
//# sourceMappingURL=BarDirectionButtons.js.map