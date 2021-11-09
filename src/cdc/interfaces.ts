export interface IFilterComponent<V> {
  clazz: (props: {
    value: V;
    onValueChanged?: (value: V) => void;
    onFieldChanged?: (field: string) => void;
    disabled: boolean;
    config: any;
    field: any;
  }) => JSX.Element;
  disableDropping?: boolean;
}


export interface IFilter<V = any> {
  id: string;
  operator?: 'AND' | 'OR';
  type: string;
  value?: any;
  field?: string;
  children?: IFilter[];
}

export const itemTypes = {
  FILTERCARD: 'filtercard'
};

export const getFilterFromTree = (
  filter: IFilter,
  id: string
): {parent: IFilter | null; current: IFilter | null} => {
  if (filter?.id === id) {
    return {current: filter, parent: null};
  } else if (filter && filter.children) {
    // Is the id part of my children?
    const current = filter.children.find((f) => f.id === id);
    if (current) {
      return {parent: filter, current};
    }
    // Otherwise, continue with all children
    for (const f of filter.children) {
      const current = getFilterFromTree(f, id);
      if (current.current) {
        return current;
      }
    }
  }
  return {parent: null, current: null};
};

// export const getTreeQuery = (filter: IFilter, components: {[key: string]: IFilterComponent<any>}) => {
//   if (!filter) {
//     return '';
//   }
//   if (!filter.children) {
//     //leaf filter
//     if (
//       filter &&
//       components &&
//       components[filter.type]?.clazz &&
//       components[filter.type]?.toFilter
//     ) {
//       return components[filter.type].toFilter(filter.componentValue);
//     } else {
//       return '';
//     }
//   } else {
//     //go through every child
//     let returnValue = '(';
//     filter.children.forEach((child, i) => {
//       returnValue += `${getTreeQuery(child, components)}${filter.children && i < filter.children.length - 1
//         ? ` ${filter?.operator?.toLowerCase()} `
//         : ''
//         }`;
//     });
//     returnValue += ')';
//     return returnValue;
//   }
// };

export interface IAlert {
  id: number;
  name: string;
  cdc_id: string;
  filter: IFilter;
  enable_mail_notification: boolean;
  latest_diff: {dictionary_item_added?: string[], dictionary_item_removed?: string[], values_changed?: {id: string, field: [], old_value: string, new_value: string}[]};
  latest_fetched_data: any;
  latest_compare_date: Date;
  modification_date: string;
  confirmed_data: any;
  confirmation_date: Date;
  compare_columns: {label: string, value: string}[];
} //TODO: remove any

export interface IUploadAlert extends Pick<IAlert, 'name' | 'cdc_id' | 'filter' | 'enable_mail_notification' | 'compare_columns'> {}

export function isAlert(obj: IAlert | IUploadAlert): obj is IAlert {
  return typeof (obj as any)?.id === 'number';
}
