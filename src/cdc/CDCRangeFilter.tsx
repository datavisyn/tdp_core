import {IFilter, IFilterComponent} from './interface';
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
  toFilter: CDCRangeFilterToString
};

export function createCDCRangeFilter(id: string, name: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue> {
  return {
    id,
    name,
    disableDropping: true,
    componentId: CDCRangeFilterId,
    componentValue: value
  };
}

function CDCRangeFilterToString(value: ICDCRangeFilterValue): string {
  // Generate filter from value
  return `(${value.config.field} >= ${value.value.min} and ${value.config.field} <= ${value.value.max})`;
}

function CDCRangeFilterComponent({value, onValueChanged, disabled}) {
  return <div className="t360-input-range-wrapper" style={{margin: '10px', paddingTop: '10px', minHeight: '50px'}}>
    <h6>{value?.config?.label}</h6>
    <InputRange
      disabled={!onValueChanged || disabled}
      minValue={value.config.minValue}
      maxValue={value.config.maxValue}
      value={value.value}
      onChange={(v) => onValueChanged?.({...value, value: v})}
    />
  </div>;
}
