import {IFilter, IFilterComponent} from './interfaces';
import * as React from 'react';
import InputRange from 'react-input-range';

export interface ICDCRangeFilterValue {
  config: {
    minValue: number;
    maxValue: number;
    label: string;
    field: string;
  };
  value: {
    min: number;
    max: number;
  };
}

export const CDCRangeFilterId = 'range';
export const CDCRangeFilter: IFilterComponent<null> = {
  clazz: CDCRangeFilterComponent,
  disableDropping: true
};

export function createCDCRangeFilter(id: string, field: string, value: {min: number, max: number}): IFilter<ICDCRangeFilterValue> {
  return {
    id,
    type: CDCRangeFilterId,
    field: field,
    value: value,
  };
}

function CDCRangeFilterComponent({value, onValueChanged, disabled, config, field}) {
  return <div className="t360-input-range-wrapper" style={{margin: '10px', paddingTop: '10px', minHeight: '50px'}}>
    <h6>{field}</h6>
    <InputRange
      disabled={!onValueChanged || disabled}
      minValue={config.minValue}
      maxValue={config.maxValue}
      value={value}
      onChange={(e) => onValueChanged?.(e)}
    />
  </div>;
}
