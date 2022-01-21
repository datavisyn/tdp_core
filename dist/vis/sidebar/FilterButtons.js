import * as React from 'react';
import { EFilterOptions } from '../interfaces';
export function FilterButtons(props) {
    const options = [EFilterOptions.IN, EFilterOptions.OUT, EFilterOptions.CLEAR];
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { key: `buttonGroupFilter`, className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, (options).map(((opt) => {
            return (React.createElement(React.Fragment, { key: `radioButtonsFilter${opt}` },
                React.createElement("input", { checked: false, onChange: (e) => props.callback(e.currentTarget.value), value: opt, type: "checkbox", className: "btn-check", id: `formButton${opt}`, autoComplete: "off" }),
                React.createElement("label", { style: { zIndex: 0 }, className: `btn btn-outline-primary w-100`, htmlFor: `formButton${opt}` }, opt)));
        })))));
}
//# sourceMappingURL=FilterButtons.js.map