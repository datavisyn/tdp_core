import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel } from './utils';
export function CategoricalColumnSelect({ callback, columns, currentSelected }) {
    const selectCatOptions = React.useMemo(() => {
        return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
    }, [columns]);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Categorical Columns"),
        React.createElement(Select, { closeMenuOnSelect: false, isMulti: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => callback(e.map((c) => c)), name: "numColumns", options: selectCatOptions, value: selectCatOptions.filter((c) => currentSelected.filter((d) => d.id === c.id).length > 0) })));
}
//# sourceMappingURL=CategoricalColumnSelect.js.map