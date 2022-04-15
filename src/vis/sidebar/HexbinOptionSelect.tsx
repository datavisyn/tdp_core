import * as React from 'react';
import Select from 'react-select';
import { EHexbinOptions } from '../interfaces';
import { formatOptionLabel } from './utils';

interface HexbinOptionSelectProps {
  callback: (c: EHexbinOptions) => void;
  currentSelected: EHexbinOptions;
}

export function HexbinOptionSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { id: EHexbinOptions.COLOR, name: EHexbinOptions.COLOR },
    { id: EHexbinOptions.BINS, name: EHexbinOptions.BINS },
    { id: EHexbinOptions.PIE, name: EHexbinOptions.PIE },
  ];
  return (
    <>
      <label className="pt-2 pb-1">Hexbin Options</label>
      <Select
        onChange={(e) => callback(e.id)}
        name="hexbinOptionSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.id}
        getOptionValue={(option) => option.name}
        options={options}
        value={{ id: currentSelected, name: currentSelected }}
      />
    </>
  );
}
