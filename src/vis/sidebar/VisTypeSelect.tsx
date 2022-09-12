import { Select } from '@mantine/core';
import * as React from 'react';
import { allVisTypes, ESupportedPlotlyVis } from '../interfaces';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  return (
    <Select
      label="Visualization Type"
      // components={{Option: optionLayout}}
      onChange={(e) => callback(e as ESupportedPlotlyVis)}
      name="visTypes"
      data={allVisTypes.map((t) => {
        return {
          value: t,
          label: t,
        };
      })}
      value={currentSelected}
    />
  );
}
