import { Select } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

interface SingleColumnSelectProps {
  callback: (s: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo;
  label: string;
  type: EColumnTypes[];
}

export function SingleColumnSelect({ callback, columns, currentSelected, label, type }: SingleColumnSelectProps) {
  const filteredColumnsByType = React.useMemo(() => {
    return columns.filter((c) => type.includes(c.type)).map((c) => ({ value: c.info.id, label: c.info.name }));
  }, [columns, type]);

  return (
    <Select
      clearable
      placeholder="Select column"
      label={label}
      onChange={(e) => callback(columns.find((c) => c.info.id === e)?.info)}
      name="numColumns"
      data={filteredColumnsByType}
      value={currentSelected?.id}
    />
  );
}
