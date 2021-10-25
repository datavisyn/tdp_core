import {IFilter, IFilterComponent} from './interface';
import * as React from 'react';

interface ICDCCheckboxFilterValue {
  fields: string[];
  filter: string[];
}

export const CDCCheckboxFilterId = 'checkbox';
export const CDCCheckboxFilter: IFilterComponent<null> = {
  clazz: CDCCheckboxFilterComponent,
  toFilter: CDCCheckboxFilterToString
};

export function createCDCCheckboxFilter(id: string, name: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue> {
  return {
    id,
    name,
    disableDropping: true,
    componentId: CDCCheckboxFilterId,
    componentValue: value
  };
}

function CDCCheckboxFilterToString(value: ICDCCheckboxFilterValue): string {
  // Generate filter from value
  return `(${value?.fields.map((v) => {return `${v} == ${value.filter.filter((f) => f === v).length > 0}`;}).join(' and ')})`;
}

export function CDCCheckboxFilterComponent({value, onValueChanged, disabled}) {
  return <>
    {value.fields.map((v, i) => {
      return (
        <div key={i} className="input-group m-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
              checked={value.filter.filter((f) => f === v).length > 0}
              disabled={!onValueChanged || disabled}
              onChange={(e) =>
                onValueChanged?.({
                  ...value,
                  fields: value.fields,
                  filter:
                    value.filter.filter((f) => f === v).length > 0
                      ? value.filter.filter((f) => f !== v)
                      : [...value.filter, v]
                })
              }
            />
            <label
              className="form-check-label"
              htmlFor="flexCheckDefault"
            >
              {v}
            </label>
          </div>
        </div>
      );
    })}
  </>;
}
