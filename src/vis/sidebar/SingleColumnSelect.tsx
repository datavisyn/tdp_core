import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface SingleColumnSelectProps {
  callback: (s: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
  label: string;
  type: EColumnTypes[];
}

export function SingleColumnSelect({ callback, columns, currentSelected, label, type }: SingleColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => type.includes(c.type)).map((c) => c.info);
  }, [columns, type]);

  return (
    <>
      <label className="pt-2 pb-1">{label}</label>
      <Select
        isClearable
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
