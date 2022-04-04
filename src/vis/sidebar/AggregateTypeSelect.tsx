import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisColumn } from '../interfaces';
import { SingleColumnSelect } from './SingleColumnSelect';
import { formatOptionLabel } from './utils';

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
  const selectOptions = React.useMemo(() => {
    return [
      { name: EAggregateTypes.COUNT, id: EAggregateTypes.COUNT },
      { name: EAggregateTypes.AVG, id: EAggregateTypes.AVG },
      { name: EAggregateTypes.MIN, id: EAggregateTypes.MIN },
      { name: EAggregateTypes.MAX, id: EAggregateTypes.MAX },
      { name: EAggregateTypes.MED, id: EAggregateTypes.MED },
    ];
  }, []);

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
        options={selectOptions}
        value={{ name: currentSelected, id: currentSelected }}
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
