import * as React from 'react';
import { MultiSelect } from '@mantine/core';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

interface NumericalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}

export function NumericalColumnSelect({ callback, columns, currentSelected }: NumericalColumnSelectProps) {
  const selectNumOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => ({ value: c.info.id, label: c.info.name }));
  }, [columns]);

  return (
    <MultiSelect
      clearable
      label="Numerical columns"
      onChange={(e: string[]) => {
        callback(columns.filter((c) => e.includes(c.info.id)).map((c) => c.info));
      }}
      name="numColumns"
      data={selectNumOptions}
      value={currentSelected.map((c) => c.id)}
    />
  );
}
