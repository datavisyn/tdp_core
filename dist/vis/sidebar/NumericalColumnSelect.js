import * as React from 'react';
import { MultiSelect } from '@mantine/core';
import { EColumnTypes } from '../interfaces';
export function NumericalColumnSelect({ callback, columns, currentSelected }) {
    const selectNumOptions = React.useMemo(() => {
        return columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => ({ value: c.info.id, label: c.info.name }));
    }, [columns]);
    return (React.createElement(MultiSelect, { clearable: true, label: "Numerical columns", onChange: (e) => {
            callback(columns.filter((c) => e.includes(c.info.id)).map((c) => c.info));
        }, name: "numColumns", data: selectNumOptions, value: currentSelected.map((c) => c.id) }));
}
//# sourceMappingURL=NumericalColumnSelect.js.map