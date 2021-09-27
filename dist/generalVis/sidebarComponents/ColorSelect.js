import * as React from 'react';
import Select from 'react-select';
import { formatOptionLabel } from '../utils/sidebarUtils';
export function ColorSelect(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Color"),
        React.createElement(Select, { isClearable: true, onChange: (e) => props.callback(e), name: 'colorSelect', formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: (props.columns.map((c) => c.info)), value: props.currentSelected ? props.currentSelected.info : [] })));
}
//# sourceMappingURL=ColorSelect.js.map