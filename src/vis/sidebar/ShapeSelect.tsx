import * as React from 'react';
import Select from 'react-select';
import { CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface ShapeSelectProps {
  callback: (shape: ColumnInfo) => void;
  columns: (NumericalColumn | CategoricalColumn)[];
  currentSelected: ColumnInfo | null;
}

export function ShapeSelect(props: ShapeSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Shape</label>
      <Select
        isClearable
        onChange={(e) => props.callback(e)}
        name="shapeSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)}
        value={props.currentSelected ? props.currentSelected : []}
      />
    </>
  );
}
