import {IFilter} from './interface';
import * as React from 'react';

export function createCDCGroupingFilter(id: string, name: string): IFilter<null> {
  return {
    id,
    name,
    disableDropping: true,
    operator: 'AND',
    children: [],
    component: {
      clazz: CDCGroupingFilter,
    }
  };
}

function CDCGroupingFilter() {
  return <div><br /></div>;
}
