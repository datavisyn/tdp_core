import { Select } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';
import { EAggregateTypes, EColumnTypes } from '../interfaces';
import { SingleColumnSelect } from './SingleColumnSelect';
export function AggregateTypeSelect({ aggregateTypeSelectCallback, aggregateColumnSelectCallback, columns, currentSelected, aggregateColumn, }) {
    const hasNumCols = useMemo(() => {
        return !!columns.find((col) => col.type === EColumnTypes.NUMERICAL);
    }, [columns]);
    const selectOptions = React.useMemo(() => {
        return [
            { disabled: false, value: EAggregateTypes.COUNT, label: EAggregateTypes.COUNT },
            { disabled: !hasNumCols, value: EAggregateTypes.AVG, label: EAggregateTypes.AVG },
            { disabled: !hasNumCols, value: EAggregateTypes.MIN, label: EAggregateTypes.MIN },
            { disabled: !hasNumCols, value: EAggregateTypes.MAX, label: EAggregateTypes.MAX },
            { disabled: !hasNumCols, value: EAggregateTypes.MED, label: EAggregateTypes.MED },
        ];
    }, [hasNumCols]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Select, { label: "Aggregate Type", onChange: (option) => aggregateTypeSelectCallback(option), name: "numColumns", data: selectOptions || [], value: currentSelected || '' }),
        currentSelected !== EAggregateTypes.COUNT ? (React.createElement(SingleColumnSelect, { type: [EColumnTypes.NUMERICAL], label: "Aggregate Column", callback: (c) => aggregateColumnSelectCallback(c), columns: columns, currentSelected: aggregateColumn })) : null));
}
//# sourceMappingURL=AggregateTypeSelect.js.map