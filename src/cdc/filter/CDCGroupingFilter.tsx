import {IFilter, IFilterComponent} from '../interfaces';
import * as React from 'react';

/* tslint:disable-next-line:variable-name */
export const CDCGroupingFilterId = 'group';
/* tslint:disable-next-line:variable-name */
export const CDCGroupingFilter: IFilterComponent<null> = {
  clazz: CDCGroupingFilterComponent,
  disableDropping: true
};

export function createCDCGroupingFilter(id: string): IFilter<null> {
  return {
    id,
    operator: 'AND',
    children: [],
    type: CDCGroupingFilterId,
  };
}

function CDCGroupingFilterComponent() {
  return <div><br /></div>;
}
