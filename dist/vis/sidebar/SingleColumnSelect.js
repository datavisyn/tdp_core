import { Select } from '@mantine/core';
import * as React from 'react';
export function SingleColumnSelect({ callback, columns, currentSelected, label, type }) {
    const filteredColumnsByType = React.useMemo(() => {
        return columns.filter((c) => type.includes(c.type)).map((c) => ({ value: c.info.id, label: c.info.name }));
    }, [columns, type]);
    return (React.createElement(Select, { clearable: true, placeholder: "Select column", label: label, onChange: (e) => callback(columns.find((c) => c.info.id === e)?.info), name: "numColumns", data: filteredColumnsByType, value: currentSelected?.id }));
}
//# sourceMappingURL=SingleColumnSelect.js.map