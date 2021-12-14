import {IFilter, IFilterComponent, IFilterComponentProps} from '../interfaces';
import * as React from 'react';
import InputRange from 'react-input-range';

export interface ICDCRangeFilterValue {
  min: number;
  max: number;
}

/* tslint:disable-next-line:variable-name */
export const CDCRangeFilterId = 'range';
/* tslint:disable-next-line:variable-name */
export const CDCRangeFilter: IFilterComponent<null> = {
  clazz: CDCRangeFilterComponent,
  disableDropping: true
};

export function createCDCRangeFilter(id: string, field: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue> {
  return {
    id,
    type: CDCRangeFilterId,
    field,
    value,
  };
}

function CDCRangeFilterComponent({value, onValueChanged, disabled, config, field}: IFilterComponentProps<ICDCRangeFilterValue>) {
  return <div className="t360-input-range-wrapper row" style={{margin: '10px', paddingTop: '10px', minHeight: '50px'}}>
    <div className="col-2 px-0">
      <h6>{field}</h6>
    </div>
    <div className="col-10 px-0">
      <InputRange
        disabled={!onValueChanged || disabled}
        minValue={config.minValue}
        maxValue={config.maxValue}
        value={value}
        onChange={(e) => typeof e === 'number' ? undefined : onValueChanged?.(e)}
      />
    </div>
  </div>;
}
