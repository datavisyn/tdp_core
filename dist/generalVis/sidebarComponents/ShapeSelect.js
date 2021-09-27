import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../types/generalTypes';
import { formatOptionLabel } from '../utils/sidebarUtils';
export function ShapeSelect(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Shape"),
        React.createElement(Select, { isClearable: true, onChange: (e) => props.callback(e), name: 'shapeSelect', formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: (props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)), value: props.currentSelected ? props.currentSelected.info : [] })));
}
//# sourceMappingURL=ShapeSelect.js.map