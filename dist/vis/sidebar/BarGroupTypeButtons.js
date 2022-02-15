import * as React from 'react';
import { EBarGroupingType } from '../interfaces';
export function BarGroupTypeButtons({ callback, currentSelected }) {
    const options = [EBarGroupingType.GROUP, EBarGroupingType.STACK];
    return (React.createElement("div", { key: "barGroupingTypeButtons", className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, options.map((opt) => {
        return (React.createElement(React.Fragment, { key: `radioButtonsFilter${opt}` },
            React.createElement("input", { checked: currentSelected === opt, onChange: (e) => callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
            React.createElement("label", { style: { zIndex: 0 }, className: "btn btn-outline-primary w-100", htmlFor: `formButton${opt}` }, opt)));
    })));
}
//# sourceMappingURL=BarGroupTypeButtons.js.map