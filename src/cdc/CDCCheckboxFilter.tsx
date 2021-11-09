import {IFilter, IFilterComponent} from './interfaces';
import * as React from 'react';

interface ICDCCheckboxFilterValue {
  [field: string]: boolean;
}

export const CDCCheckboxFilterId = 'checkbox';
export const CDCCheckboxFilter: IFilterComponent<null> = {
  clazz: CDCCheckboxFilterComponent,
  disableDropping: true
};

export function createCDCCheckboxFilter(id: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue> {
  return {
    id,
    type: CDCCheckboxFilterId,
    value: value
  };
}

export function CDCCheckboxFilterComponent({value, onValueChanged, disabled, config, field}) {
  return <>
    {Object.entries(value).map(([field, flag], i) => {
      return (
        <div key={i} className="input-group m-1">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="flexCheckDefault"
              checked={flag? true : false}
              disabled={!onValueChanged || disabled}
              onChange={(e) =>
                onValueChanged?.({
                  ...value,
                  [field]: e
                })}
            />
            <label
              className="form-check-label"
              htmlFor="flexCheckDefault"
            >
              {field}
            </label>
          </div>
        </div>
      );
    })}
  </>;
}
