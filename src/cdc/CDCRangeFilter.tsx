import {IFilter, IFilterComponent} from './interface';
import * as React from 'react';
import InputRange from 'react-input-range';

export interface ICDCRangeFilterValue {
  min: number;
  max: number;
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
  return `(item["id"] >= ${value.min} and item["id"] <= ${value.max})`;
}

function CDCRangeFilterComponent({value, onValueChanged, disabled}) {
  return <div className="t360-input-range-wrapper" style={{margin: '10px', paddingTop: '10px', minHeight: '50px'}}>
    <InputRange
      disabled={!onValueChanged || disabled}
      minValue={1}
      maxValue={10}
      value={{min: value.min, max: value.max}}
      onChange={(v) => onValueChanged?.(v)}
    />
  </div>;
}
