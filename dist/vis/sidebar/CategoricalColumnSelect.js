import { MultiSelect } from '@mantine/core';
import * as React from 'react';
import { EColumnTypes } from '../interfaces';
export function CategoricalColumnSelect({ callback, columns, currentSelected }) {
    const selectCatOptions = React.useMemo(() => {
        return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => ({ value: c.info.id, label: c.info.name }));
    }, [columns]);
    return (React.createElement(MultiSelect, { placeholder: "Select Column", label: "Categorical columns", clearable: true, onChange: (e) => callback(columns.filter((c) => e.includes(c.info.id)).map((c) => c.info)), name: "numColumns", data: selectCatOptions, value: selectCatOptions.filter((c) => currentSelected.filter((d) => d.id === c.value).length > 0).map((c) => c.value) }));
}
//# sourceMappingURL=CategoricalColumnSelect.js.map