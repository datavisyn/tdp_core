import { Select } from '@mantine/core';
import * as React from 'react';
import { I18nextManager } from '../../i18n/I18nextManager';
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
  return (
    <Select
      label={I18nextManager.getInstance().i18n.t('tdp:core.vis.hexbinOptions')}
      onChange={(e) => callback(e as EHexbinOptions)}
      data={options}
      value={currentSelected}
    />
  );
}
