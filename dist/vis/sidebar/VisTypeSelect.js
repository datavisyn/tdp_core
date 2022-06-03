import * as React from 'react';
import Select from 'react-select';
import { GetVisualizations } from '../AllVisualizations';
export function VisTypeSelect({ callback, currentSelected }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Visualization Type"),
        React.createElement(Select, { closeMenuOnSelect: true, 
            // components={{Option: optionLayout}}
            onChange: (e) => callback(e.value), name: "visTypes", options: GetVisualizations().map((vis) => ({
                value: vis.type,
                label: vis.type,
            })), value: { value: currentSelected, label: currentSelected } })));
}
//# sourceMappingURL=VisTypeSelect.js.map