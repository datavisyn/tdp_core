import * as React from 'react';
import Select from 'react-select';
import { allVisTypes } from '../types/generalTypes';
export function VisTypeSelect(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Visualization Type"),
        React.createElement(Select, { closeMenuOnSelect: true, 
            // components={{Option: optionLayout}}
            onChange: (e) => props.callback(e.value), name: "visTypes", options: allVisTypes.map((t) => {
                return {
                    value: t,
                    label: t
                };
            }), value: { value: props.currentSelected, label: props.currentSelected } })));
}
//# sourceMappingURL=VisTypeSelect.js.map