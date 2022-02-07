import * as React from 'react';
import Select from 'react-select';
import { ENumericalColorScaleType } from '../scatter/utils';
import { VisCategoricalColumn, ColumnInfo, EColumnTypes, VisNumericalColumn, VisColumn } from '../interfaces';
import { formatOptionLabel, getCol } from './utils';
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
    <>
      <label className="pt-2 pb-1">Color</label>
      <Select
        isClearable
        onChange={(e) => callback(e)}
        name="colorSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={columns.map((c) => c.info)}
        value={currentSelected || []}
      />
      {currentNumType && currentSelected && getCol(columns, currentSelected).type === EColumnTypes.NUMERICAL ? (
        <NumericalColorButtons callback={numTypeCallback} currentSelected={currentNumType} />
      ) : null}
    </>
  );
}
