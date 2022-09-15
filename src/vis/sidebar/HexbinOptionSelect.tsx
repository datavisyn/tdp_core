import { Select } from '@mantine/core';
import * as React from 'react';
import { EHexbinOptions } from '../interfaces';

interface HexbinOptionSelectProps {
  callback: (c: EHexbinOptions) => void;
  currentSelected: EHexbinOptions;
}

export function HexbinOptionSelect({ callback, currentSelected }: HexbinOptionSelectProps) {
  const options = [
    { value: EHexbinOptions.COLOR, label: EHexbinOptions.COLOR },
    { value: EHexbinOptions.BINS, label: EHexbinOptions.BINS },
    { value: EHexbinOptions.PIE, label: EHexbinOptions.PIE },
  ];
  return <Select label="Hexbin Options" onChange={(e) => callback(e as EHexbinOptions)} data={options} value={currentSelected} />;
}
