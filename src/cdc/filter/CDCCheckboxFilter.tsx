import {IFilter, IFilterComponent} from '../interfaces';
import * as React from 'react';
import Checkbox from 'react-three-state-checkbox';

interface ICDCCheckboxFilterValue {
  [field: string]: boolean;
}

/* tslint:disable-next-line:variable-name */
export const CDCCheckboxFilterId = 'checkbox';
/* tslint:disable-next-line:variable-name */
export const CDCCheckboxFilter: IFilterComponent<null> = {
  clazz: CDCCheckboxFilterComponent,
  disableDropping: true
};

export function createCDCCheckboxFilter(id: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue> {
  return {
    id,
    type: CDCCheckboxFilterId,
    value
  };
}


export function CDCCheckboxFilterComponent({value, onValueChanged, disabled, config}) {
  const onChange = (value, field, e) => {
    if (value[field] === false) {
      const newVal = {};
      Object.keys(value).forEach((key) => {
        if (key !== field) {
          newVal[key] = value[key];
        }
      });
      return newVal;
    } else {
      return {...value, [field]: e.target.checked};
    }
  };

  return <>
    {config.fields.map((field, i) => {
      return (
        <div key={i} className="input-group m-1">
          <div className="form-check">
            <Checkbox
              disabled={disabled}
              checked={value[field]}
              className="form-check-input"
              indeterminate={value[field] == null ? true : false}
              onChange={(e) =>
                onValueChanged?.(onChange(value, field, e))}
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
