import {IFilter, IFilterComponent} from './interface';
import * as React from 'react';
import Select from 'react-select';

export interface ICDCTextFilterValue {
  fields: {
    field: {label: string, value: string};
    options: {label: string, value: string}[];
  }[];
  filter: {
    field: {label: string, value: string}
    value: {label: string, value: string}[]
  }[];
}

export const CDCTextFilterId = 'text';
export const CDCTextFilter: IFilterComponent<null> = {
  clazz: CDCTextFilterComponent,
  toFilter: CDCTextFilterToString
};

export function createCDCTextFilter(id: string, name: string, value: ICDCTextFilterValue): IFilter<ICDCTextFilterValue> {
  return {
    id,
    name,
    disableDropping: true,
    componentId: CDCTextFilterId,
    componentValue: value
  };
}

function CDCTextFilterToString(value: ICDCTextFilterValue): string {
  // Generate filter from value
  return `(${value.filter
    .map((v) => `${v.field.value} in (${v.value.map((vV => vV.value)).join(',')})`)
    .join(' and ')})`;
}

export function CDCTextFilterComponent({value, onValueChanged, disabled}) {
  return <>
    {value.filter.map((v, i) => (
      <div key={i} className="input-group m-1 row">
        <div className="col-3 p-0">
          <Select
            isDisabled={!onValueChanged || disabled}
            value={v.field}
            options={[...value.fields.map((field) => field.field)]}
            onChange={(e) =>
              onValueChanged?.({
                ...value,
                filter: value.filter.map((oldV) =>
                  oldV === v
                    ? {
                      ...v,
                      field: e,
                      value: []
                    }
                    : oldV
                )
              })
            }
          />
        </div>
        <div className="col-7 p-0">
          <Select
            closeMenuOnSelect={false}
            isDisabled={!onValueChanged || disabled || !v.field}
            isMulti
            value={v.value}
            options={value.fields.find((f) => f.field === v.field)?.options}
            onChange={(e) =>
              onValueChanged?.({
                ...value,
                filter: value.filter.map((oldV) =>
                  oldV === v
                    ? {
                      ...v,
                      value: e
                    }
                    : oldV
                )
              })
            }
          />
        </div>
        {disabled ? null :
          <div className="col-1 p-0">
            <button
              disabled={!onValueChanged}
              onClick={(e) =>
                onValueChanged?.({
                  ...value,
                  filter: value.filter.filter((oldV) => oldV !== v)
                })
              }
              className="btn btn-text-secondary"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        }
      </div>
    ))}
    {onValueChanged && !disabled ? (
      <button
        className="btn btn-text-secondary m-1"
        onClick={() => {
          onValueChanged({
            ...value,
            filter: [
              ...value.filter,
              {
                field: '',
                value: []
              }
            ]
          });
        }}
      >
        <i className="fas fa-plus"></i>
      </button>
    ) : null}
  </>;
}
