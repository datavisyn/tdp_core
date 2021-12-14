import * as React from 'react';
import { useMemo } from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../types/generalTypes';
import { formatOptionLabel } from '../utils/sidebarUtils';
export function NumericalColumnSelect(props) {
    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Numerical Columns"),
        React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => props.callback(e.map((c) => c)), name: "numColumns", options: selectNumOptions, value: selectNumOptions.filter((c) => props.currentSelected.filter((d) => d.id === c.id).length > 0) })));
}
//# sourceMappingURL=NumericalColumnSelect.js.map