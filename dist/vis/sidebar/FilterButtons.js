import * as React from 'react';
import { EFilterOptions } from '../interfaces';
export function FilterButtons({ callback }) {
    const options = [
        {
            name: EFilterOptions.IN,
            tooltip: 'Filters any point not currently selected',
        },
        {
            name: EFilterOptions.OUT,
            tooltip: 'Filters all currently selected points',
        },
        {
            name: EFilterOptions.CLEAR,
            tooltip: 'Removes any existing filter',
        },
    ];
    return (React.createElement("div", { key: "buttonGroupFilter", className: "btn-group w-100 px-2 pt-3", role: "group", "aria-label": "Basic outlined example" }, options.map((opt) => {
        return (React.createElement(React.Fragment, { key: `radioButtonsFilter${opt.name}` },
            React.createElement("input", { checked: false, onChange: (e) => callback(e.currentTarget.value), value: opt.name, type: "checkbox", className: "btn-check", id: `formButton${opt.name}`, autoComplete: "off" }),
            React.createElement("label", { title: opt.tooltip, className: "align-items-center justify-content-center d-flex btn btn-outline-primary w-100", htmlFor: `formButton${opt.name}` }, opt.name)));
    })));
}
//# sourceMappingURL=FilterButtons.js.map