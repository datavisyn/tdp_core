import {IFilter, IFilterComponent, IFilterComponentProps} from '../interfaces';
import * as React from 'react';
import {uniqueId} from 'lodash';

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

export function CDCCheckboxFilterComponent({value, onValueChanged, disabled, config}: IFilterComponentProps<ICDCCheckboxFilterValue>) {
  const id = React.useMemo(() => uniqueId('CDCCheckboxFilterComponent'), []);

  return <>
    {config.fields.map((field, i) => {
      return (
        <div key={i} className="input-group m-1">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="" id={`${id}-${field}`}
              disabled={disabled} 
              checked={value[field]}
              onChange={(e) => {
                if (value[field] === false) {
                  const newVal = {};
                  Object.keys(value).forEach((key) => {
                    if (key !== field) {
                      newVal[key] = value[key];
                    }
                  });
                  onValueChanged?.(newVal);
                } else {
                  onValueChanged?.({...value, [field]: e.target.checked});
                }
              }} />
            <label
              className="form-check-label"
              htmlFor={`${id}-${field}`}
            >
              {field}
            </label>
          </div>
        </div>
      );
    })}
  </>;
}
