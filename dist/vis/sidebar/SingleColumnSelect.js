import * as React from 'react';
import Select from 'react-select';
import { formatOptionLabel } from './utils';
export function SingleColumnSelect({ callback, columns, currentSelected, label, type }) {
    const selectCatOptions = React.useMemo(() => {
        return columns.filter((c) => type.includes(c.type)).map((c) => c.info);
    }, [columns, type]);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, label),
        React.createElement(Select, { closeMenuOnSelect: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => callback(e), name: "numColumns", options: selectCatOptions, value: selectCatOptions.filter((c) => (currentSelected === null || currentSelected === void 0 ? void 0 : currentSelected.id) === c.id) })));
}
//# sourceMappingURL=SingleColumnSelect.js.map