import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface CategoricalColumnSelectProps {
  callback: (s: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
}

export function CategoricalColumnSingleSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
  }, [columns]);

  return (
    <>
      <label className="pt-2 pb-1">Categorical Column</label>
      <Select
        closeMenuOnSelect
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        onChange={(e) => callback(e)}
        name="numColumns"
        options={selectCatOptions}
        value={selectCatOptions.filter((c) => currentSelected?.id === c.id)}
      />
    </>
  );
}
