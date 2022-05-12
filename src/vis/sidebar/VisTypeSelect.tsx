import * as React from 'react';
import Select from 'react-select';
import { ESupportedPlotlyVis } from '../interfaces';

interface VisTypeSelectProps {
  callback: (s: ESupportedPlotlyVis) => void;
  currentSelected: ESupportedPlotlyVis;
}

export function VisTypeSelect({ callback, currentSelected }: VisTypeSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Visualization Type</label>
      <Select
        closeMenuOnSelect
        // components={{Option: optionLayout}}
        onChange={(e) => callback(e.value)}
        name="visTypes"
        options={Object.values(ESupportedPlotlyVis).map((t) => {
          return {
            value: t,
            label: t,
          };
        })}
        value={{ value: currentSelected, label: currentSelected }}
      />
    </>
  );
}
