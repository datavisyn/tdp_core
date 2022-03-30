import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel } from './utils';
export function ShapeSelect({ callback, columns, currentSelected }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Shape"),
        React.createElement(Select, { isClearable: true, onChange: (e) => callback(e), name: "shapeSelect", formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info), value: currentSelected || [] })));
}
//# sourceMappingURL=ShapeSelect.js.map