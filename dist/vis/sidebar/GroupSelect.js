import * as React from 'react';
import Select from 'react-select';
import { EBarGroupingType, EColumnTypes } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';
import { formatOptionLabel } from './utils';
export function GroupSelect({ groupColumnSelectCallback, groupTypeSelectCallback, groupDisplaySelectCallback, groupType, displayType, columns, currentSelected, }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Group"),
        React.createElement(Select, { isClearable: true, onChange: (e) => groupColumnSelectCallback(e), name: "groupSelect", formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, options: columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info), value: currentSelected || [] }),
        currentSelected ? (React.createElement(BarGroupTypeButtons, { callback: (newGroupType) => groupTypeSelectCallback(newGroupType), currentSelected: groupType })) : null,
        currentSelected && groupType === EBarGroupingType.STACK ? (React.createElement(BarDisplayButtons, { callback: (display) => groupDisplaySelectCallback(display), currentSelected: displayType })) : null));
}
//# sourceMappingURL=GroupSelect.js.map