import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel, getCol } from './utils';
import { NumericalColorButtons } from './NumericalColorButtons';
export function ColorSelect(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Color"),
        React.createElement(Select, { isClearable: true, onChange: (e) => props.callback(e), name: 'colorSelect', formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: (props.columns.map((c) => c.info)), value: props.currentSelected ? props.currentSelected : [] }),
        props.currentSelected && getCol(props.columns, props.currentSelected).type === EColumnTypes.NUMERICAL
            ? React.createElement(NumericalColorButtons, { callback: props.numTypeCallback, currentSelected: props.currentNumType })
            : null));
}
//# sourceMappingURL=ColorSelect.js.map