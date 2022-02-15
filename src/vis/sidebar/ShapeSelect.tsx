import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface ShapeSelectProps {
  callback: (shape: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function ShapeSelect({ callback, columns, currentSelected }: ShapeSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Shape</label>
      <Select
        isClearable
        onChange={(e) => callback(e)}
        name="shapeSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)}
        value={currentSelected || []}
      />
    </>
  );
}
