import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel, getCol } from './utils';
import { NumericalColorButtons } from './NumericalColorButtons';
export function ColorSelect({ callback, numTypeCallback = () => null, currentNumType = null, columns, currentSelected }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Color"),
        React.createElement(Select, { isClearable: true, onChange: (e) => callback(e), name: "colorSelect", formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: columns.map((c) => c.info), value: currentSelected || [] }),
        currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (React.createElement(NumericalColorButtons, { callback: numTypeCallback, currentSelected: currentNumType })) : null));
}
//# sourceMappingURL=ColorSelect.js.map