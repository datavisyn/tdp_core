import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface GroupSelectProps {
  callback: (c: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function GroupSelect({ callback, columns, currentSelected }: GroupSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Group</label>
      <Select
        isClearable
        onChange={(e) => callback(e)}
        name="groupSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)}
        value={currentSelected || []}
      />
    </>
  );
}
