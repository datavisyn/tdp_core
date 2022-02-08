import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface MultiplesSelectProps {
  callback: (c: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function MultiplesSelect({ callback, columns, currentSelected }: MultiplesSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Multiples</label>
      <Select
        isClearable
        onChange={(e) => callback(e)}
        name="multiplesSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)}
        value={currentSelected || []}
      />
    </>
  );
}
