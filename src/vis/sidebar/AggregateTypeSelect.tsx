import * as React from 'react';
import { useMemo } from 'react';
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
      { disabled: false, value: EAggregateTypes.COUNT, label: EAggregateTypes.COUNT },
      { disabled: !hasNumCols, value: EAggregateTypes.AVG, label: EAggregateTypes.AVG },
      { disabled: !hasNumCols, value: EAggregateTypes.MIN, label: EAggregateTypes.MIN },
      { disabled: !hasNumCols, value: EAggregateTypes.MAX, label: EAggregateTypes.MAX },
      { disabled: !hasNumCols, value: EAggregateTypes.MED, label: EAggregateTypes.MED },
    ];
  }, [hasNumCols]);

  return (
    <>
      <label className="pt-2 pb-1">Aggregate Type</label>
      <Select
        closeMenuOnSelect
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        onChange={(option) => aggregateTypeSelectCallback(option.value as EAggregateTypes)}
        name="numColumns"
        options={selectOptions || []}
        isOptionDisabled={(option) => (option.value === EAggregateTypes.COUNT ? false : !hasNumCols)}
        value={{ label: currentSelected || '', value: currentSelected || '', disabled: false }}
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
