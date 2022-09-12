import * as React from 'react';
import { Select, Stack } from '@mantine/core';
import { ColumnInfo, EColumnTypes, VisColumn, ENumericalColorScaleType } from '../interfaces';
import { getCol } from './utils';
import { NumericalColorButtons } from './NumericalColorButtons';

interface ColorSelectProps {
  callback: (c: ColumnInfo) => void;
  numTypeCallback?: (c: ENumericalColorScaleType) => void;
  currentNumType?: ENumericalColorScaleType;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function ColorSelect({ callback, numTypeCallback = () => null, currentNumType = null, columns, currentSelected }: ColorSelectProps) {
  return (
    <Stack spacing="sm">
      <Select
        clearable
        placeholder="Select Column"
        label="Color"
        onChange={(e) => callback(columns.find((c) => c.info.id === e)?.info)}
        name="colorSelect"
        data={columns.map((c) => ({ value: c.info.id, label: c.info.name }))}
        value={currentSelected?.id}
      />
      {currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (
        <NumericalColorButtons callback={numTypeCallback} currentSelected={currentNumType} />
      ) : null}
    </Stack>
  );
}
