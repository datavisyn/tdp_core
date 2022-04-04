import * as React from 'react';
import Select from 'react-select';
import { EAggregateTypes, EColumnTypes } from '../interfaces';
import { SingleColumnSelect } from './SingleColumnSelect';
import { formatOptionLabel } from './utils';
export function AggregateTypeSelect({ aggregateTypeSelectCallback, aggregateColumnSelectCallback, columns, currentSelected, aggregateColumn, }) {
    const selectOptions = React.useMemo(() => {
        return [
            { name: EAggregateTypes.COUNT, id: EAggregateTypes.COUNT },
            { name: EAggregateTypes.AVG, id: EAggregateTypes.AVG },
            { name: EAggregateTypes.MIN, id: EAggregateTypes.MIN },
            { name: EAggregateTypes.MAX, id: EAggregateTypes.MAX },
            { name: EAggregateTypes.MED, id: EAggregateTypes.MED },
        ];
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Aggregate Type"),
        React.createElement(Select, { closeMenuOnSelect: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => aggregateTypeSelectCallback(e.id), name: "numColumns", options: selectOptions, value: { name: currentSelected, id: currentSelected } }),
        currentSelected !== EAggregateTypes.COUNT ? (React.createElement(SingleColumnSelect, { type: [EColumnTypes.NUMERICAL], label: "Aggregate Column", callback: (c) => aggregateColumnSelectCallback(c), columns: columns, currentSelected: aggregateColumn })) : null));
}
//# sourceMappingURL=AggregateTypeSelect.js.map