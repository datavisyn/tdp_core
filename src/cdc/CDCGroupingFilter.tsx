import {IFilter, IFilterComponent} from './interface';
import * as React from 'react';

export const CDCGroupingFilterId = 'group';
export const CDCGroupingFilter: IFilterComponent<null> = {
  clazz: CDCGroupingFilterComponent,
}

export function createCDCGroupingFilter(id: string, name: string): IFilter<null> {
  return {
    id,
    name,
    disableDropping: true,
    operator: 'AND',
    children: [],
    componentId: CDCGroupingFilterId,
    componentValue: null
  };
}

function CDCGroupingFilterComponent() {
  return <div><br /></div>;
}
