import * as React from 'react';
import Select from 'react-select';
import { EColumnTypes } from '../../types/generalTypes';
import { formatOptionLabel } from '../../utils/sidebarUtils';
export function GroupSelect(props) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Group"),
        React.createElement(Select, { isClearable: true, onChange: (e) => props.callback(e), name: 'groupSelect', formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: (props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)), value: props.currentSelected ? props.currentSelected : [] })));
}
//# sourceMappingURL=GroupSelect.js.map