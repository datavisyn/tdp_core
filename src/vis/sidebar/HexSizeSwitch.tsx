import { Switch } from '@mantine/core';
import * as React from 'react';

interface HexSizeSwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexSizeSwitch({ callback, currentValue }: HexSizeSwitchProps) {
  return <Switch checked={currentValue} onChange={(event) => callback(event.currentTarget.checked)} label="Size scale" />;
}
