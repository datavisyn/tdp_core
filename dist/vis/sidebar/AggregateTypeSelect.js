import * as React from 'react';
import Highlighter from 'react-highlight-words';
import Select from 'react-select';
import { EAggregateTypes, EColumnTypes } from '../interfaces';
import { SingleColumnSelect } from './SingleColumnSelect';
function formatOptionLabel(option, ctx) {
    return (React.createElement(React.Fragment, null,
        React.createElement(Highlighter, { searchWords: [ctx.inputValue], autoEscape: true, textToHighlight: option.name }),
        option.description && React.createElement("span", { className: "small text-muted ms-1" }, option.description),
        option.disabled ? React.createElement("i", { className: "ms-1 fas fa-question-circle", title: "No numerical columns available for this aggregation type" }) : null));
}
export function AggregateTypeSelect({ aggregateTypeSelectCallback, aggregateColumnSelectCallback, columns, currentSelected, aggregateColumn, }) {
    const selectOptions = React.useMemo(() => {
        return [
            { disabled: false, id: EAggregateTypes.COUNT, name: EAggregateTypes.COUNT },
            { disabled: !aggregateColumn, id: EAggregateTypes.AVG, name: EAggregateTypes.AVG },
            { disabled: !aggregateColumn, id: EAggregateTypes.MIN, name: EAggregateTypes.MIN },
            { disabled: !aggregateColumn, id: EAggregateTypes.MAX, name: EAggregateTypes.MAX },
            { disabled: !aggregateColumn, id: EAggregateTypes.MED, name: EAggregateTypes.MED },
        ];
    }, [aggregateColumn]);
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Aggregate Type"),
        React.createElement(Select, { closeMenuOnSelect: true, formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.name, getOptionValue: (option) => option.id, onChange: (e) => aggregateTypeSelectCallback(e.id), name: "numColumns", options: selectOptions || [], isOptionDisabled: (option) => (option.id === EAggregateTypes.COUNT ? false : !aggregateColumn), value: { label: currentSelected, id: currentSelected, name: currentSelected || '' } }),
        currentSelected !== EAggregateTypes.COUNT ? (React.createElement(SingleColumnSelect, { type: [EColumnTypes.NUMERICAL], label: "Aggregate Column", callback: (c) => aggregateColumnSelectCallback(c), columns: columns, currentSelected: aggregateColumn })) : null));
}
//# sourceMappingURL=AggregateTypeSelect.js.map