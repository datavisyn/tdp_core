import {IFilter, IFilterComponent} from './interface';
import * as React from 'react';
import Select from 'react-select';

export interface ICDCTextFilterValue {
  fields: {
    field: string,
    options: string[]
  }[];
  filter: {
    field: string,
    value: string[]
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
    .map((v) => `${v.field} in (${v.value.join(',')})`)
    .join(' and ')})`;
}

export function CDCTextFilterComponent({value, onValueChanged, disabled}) {
  return <>
    {value.filter.map((v, i) => (
      <div key={i} className="input-group m-1">
        <select
          className="form-select"
          disabled={!onValueChanged || disabled}
          value={v.field}
          onChange={(e) =>
            onValueChanged?.({
              ...value,
              filter: value.filter.map((oldV) =>
                oldV === v
                  ? {
                    ...v,
                    field: e.currentTarget.value,
                    value: []
                  }
                  : oldV
              )
            })
          }
        >
          <option value="">Select...</option>
          {value.fields.map((f) => (
            <option value={f.field} key={f.field}>
              {f.field}
            </option>
          ))}
        </select>
        <div style={{width: '70%'}}>
          <Select
            closeMenuOnSelect={false}
            isDisabled={!onValueChanged || disabled}
            isMulti
            value={v.value.map((value) => ({label: value, value}))}
            options={value.fields
              .find((f) => f.field === v.field)
              ?.options.map((o) => {
                return {value: o, label: o};
              })}
            onChange={(e) =>
              onValueChanged?.({
                ...value,
                filter: value.filter.map((oldV) =>
                  oldV === v
                    ? {
                      ...v,
                      value: e.map((value) => (value as any).value)
                    }
                    : oldV
                )
              })
            }
          />
        </div>
        {disabled ? null :
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
