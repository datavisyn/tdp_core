import { Switch } from '@mantine/core';
import * as React from 'react';

interface HexOpacitySwitchProps {
  callback: (b: boolean) => void;
  currentValue: boolean;
}

export function HexOpacitySwitch({ callback, currentValue }: HexOpacitySwitchProps) {
  return <Switch checked={currentValue} onChange={(event) => callback(event.currentTarget.checked)} label="Opacity scale" />;
}
