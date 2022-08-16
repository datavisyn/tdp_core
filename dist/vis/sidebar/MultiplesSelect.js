import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel } from './utils';
export function MultiplesSelect({ callback, columns, currentSelected }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Multiples"),
        React.createElement(Select, { isClearable: true, onChange: (e) => callback(e), name: "multiplesSelect", formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info), value: currentSelected || [] })));
}
//# sourceMappingURL=MultiplesSelect.js.map