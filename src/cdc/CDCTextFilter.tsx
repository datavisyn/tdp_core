import {IFilter, IFilterComponent} from './interfaces';
import * as React from 'react';
import Select from 'react-select';

export interface ICDCTextFilterValue {}

export const CDCTextFilterId = 'text';
export const CDCTextFilter: IFilterComponent<null> = {
  clazz: CDCTextFilterComponent,
  disableDropping: true
};

export function createCDCTextFilter(id: string, field: string, value: string[]): IFilter<ICDCTextFilterValue> {
  return {
    id,
    type: CDCTextFilterId,
    field: field,
    value: value,
  };
}

export function CDCTextFilterComponent({value, onValueChanged, onFieldChanged, disabled, field, config}) {
  return <>
    <div className="input-group m-1 row">
      <div className="col-4 p-0">
        <Select
          isDisabled={!onValueChanged || disabled}
          value={{label: field, value: field}}
          options={[...config?.map((conf) => {return {label: conf.field, value: conf.field}})]}
          onChange={(e) => onFieldChanged?.(e.value)}
        />
      </div>
      <div className="col-8 p-0">
        <Select
          closeMenuOnSelect={false}
          isDisabled={!onValueChanged || disabled || !field}
          isMulti
          value={value?.map((v) => {return {label: v, value: v}})}
          options={config?.find((f) => f?.field === field)?.options.map((o) => {return {label: o, value: o}})}
          onChange={(e) => onValueChanged?.([...e.map((v) => v.value)])}
        />
      </div>
    </div>
  </>;
}
