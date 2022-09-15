import { Select, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarGroupingType, EColumnTypes } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';
export function GroupSelect({ groupColumnSelectCallback, groupTypeSelectCallback, groupDisplaySelectCallback, groupType, displayType, columns, currentSelected, }) {
    return (React.createElement(Stack, { spacing: "sm" },
        React.createElement(Select, { clearable: true, placeholder: "Select Column", label: "Group", onChange: (e) => groupColumnSelectCallback(columns.find((c) => c.info.id === e)?.info), data: columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => ({ value: c.info.id, label: c.info.name })), value: currentSelected?.id }),
        currentSelected ? (React.createElement(BarGroupTypeButtons, { callback: (newGroupType) => groupTypeSelectCallback(newGroupType), currentSelected: groupType })) : null,
        currentSelected && groupType === EBarGroupingType.STACK ? (React.createElement(BarDisplayButtons, { callback: (display) => groupDisplaySelectCallback(display), currentSelected: displayType })) : null));
}
//# sourceMappingURL=GroupSelect.js.map