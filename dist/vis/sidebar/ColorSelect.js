import * as React from 'react';
import { Select, Stack } from '@mantine/core';
import { EColumnTypes } from '../interfaces';
import { getCol } from './utils';
import { NumericalColorButtons } from './NumericalColorButtons';
export function ColorSelect({ callback, numTypeCallback = () => null, currentNumType = null, columns, currentSelected }) {
    return (React.createElement(Stack, { spacing: "sm" },
        React.createElement(Select, { clearable: true, placeholder: "Select Column", label: "Color", onChange: (e) => callback(columns.find((c) => c.info.id === e)?.info), name: "colorSelect", data: columns.map((c) => ({ value: c.info.id, label: c.info.name })), value: currentSelected?.id }),
        currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (React.createElement(NumericalColorButtons, { callback: numTypeCallback, currentSelected: currentNumType })) : null));
}
//# sourceMappingURL=ColorSelect.js.map