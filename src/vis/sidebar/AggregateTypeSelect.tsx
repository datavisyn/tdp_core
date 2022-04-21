import * as React from 'react';
import { useMemo } from 'react';
import Highlighter from 'react-highlight-words';
import Select from 'react-select';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisColumn } from '../interfaces';
import { SingleColumnSelect } from './SingleColumnSelect';

interface AggregateTypeSelectProps {
  aggregateTypeSelectCallback: (s: EAggregateTypes) => void;
  aggregateColumn: ColumnInfo | null;
  aggregateColumnSelectCallback: (c: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: EAggregateTypes;
}

function formatOptionLabel(option, ctx) {
  return (
    <>
      <Highlighter searchWords={[ctx.inputValue]} autoEscape textToHighlight={option.name} />
      {option.description && <span className="small text-muted ms-1">{option.description}</span>}
      {option.disabled ? <i className="ms-1 fas fa-question-circle" title="No numerical columns available for this aggregation type" /> : null}
    </>
  );
}

export function AggregateTypeSelect({
  aggregateTypeSelectCallback,
  aggregateColumnSelectCallback,
  columns,
  currentSelected,
  aggregateColumn,
}: AggregateTypeSelectProps) {
  const hasNumCols = useMemo(() => {
    return !!columns.find((col) => col.type === EColumnTypes.NUMERICAL);
  }, [columns]);

  const selectOptions = React.useMemo(() => {
    return [
      { disabled: false, id: EAggregateTypes.COUNT, name: EAggregateTypes.COUNT },
      { disabled: !hasNumCols, id: EAggregateTypes.AVG, name: EAggregateTypes.AVG },
      { disabled: !hasNumCols, id: EAggregateTypes.MIN, name: EAggregateTypes.MIN },
      { disabled: !hasNumCols, id: EAggregateTypes.MAX, name: EAggregateTypes.MAX },
      { disabled: !hasNumCols, id: EAggregateTypes.MED, name: EAggregateTypes.MED },
    ];
  }, [hasNumCols]);

  return (
    <>
      <label className="pt-2 pb-1">Aggregate Type</label>
      <Select
        closeMenuOnSelect
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        onChange={(e) => aggregateTypeSelectCallback(e.id)}
        name="numColumns"
        options={selectOptions || []}
        isOptionDisabled={(option) => (option.id === EAggregateTypes.COUNT ? false : !hasNumCols)}
        value={{ label: currentSelected, id: currentSelected, name: currentSelected }}
      />
      {currentSelected !== EAggregateTypes.COUNT ? (
        <SingleColumnSelect
          type={[EColumnTypes.NUMERICAL]}
          label="Aggregate Column"
          callback={(c: ColumnInfo) => aggregateColumnSelectCallback(c)}
          columns={columns}
          currentSelected={aggregateColumn}
        />
      ) : null}
    </>
  );
}
