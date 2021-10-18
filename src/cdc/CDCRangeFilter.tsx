import {IFilter} from './interface';
import * as React from 'react';
import InputRange from 'react-input-range';


export interface ICDCRangeFilterValue {
  min: number;
  max: number;
}

export function createCDCRangeFilter(id: string, name: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue> {
  return {
    id,
    name,
    disableDropping: true,
    component: {
      clazz: CDCRangeFilter,
      toFilter: CDCRangeFilterToString,
      value,
    }
  };
}

function CDCRangeFilterToString(value: ICDCRangeFilterValue): string {
  // Generate filter from value
  return `(date >= ${value.min} and date <= ${value.max})`;
}

function CDCRangeFilter({ value, onValueChanged }) {
  return <div className="t360-input-range-wrapper" style={{ margin: '10px', paddingTop: '10px', minHeight: '50px' }}>
    <InputRange
        disabled={!onValueChanged}
        maxValue={2021}
        minValue={1950}
        value={{min: value.min, max: value.max}}
        onChange={(v) => onValueChanged?.(v)}
    />
    </div>;
}

