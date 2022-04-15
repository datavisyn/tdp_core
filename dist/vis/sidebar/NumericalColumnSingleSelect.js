import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../interfaces';
import { formatOptionLabel } from './utils';
export function CategoricalColumnSingleSelect({ callback, columns, currentSelected }) {
    const selectCatOptions = React.useMemo(() => {
        return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
    }, [columns]);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Categorical Column"),
        React.createElement(Select, { closeMenuOnSelect: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => callback(e), name: "numColumns", options: selectCatOptions, value: selectCatOptions.filter((c) => (currentSelected === null || currentSelected === void 0 ? void 0 : currentSelected.id) === c.id) })));
}
//# sourceMappingURL=NumericalColumnSingleSelect.js.map