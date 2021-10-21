export interface IFilterComponent<V> {
  clazz: (props: {
    value: V;
    onValueChanged?: (value: V) => void;
  }) => JSX.Element;
  toFilter?: (value: V) => string;
}

export interface IFilter<V = any> {
  id: string;
  name: string;
  disableRemoving?: boolean;
  disableDragging?: boolean;
  disableDropping?: boolean;
  operator?: 'AND' | 'OR' | 'NOT';
  componentId: string;
  componentValue: V;
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

export const getTreeQuery = (filter: IFilter, components: {[key: string]: IFilterComponent<any>}) => {
  if (!filter) {
    return '';
  }
  if (!filter.children) {
    //leaf filter

    if (
      filter &&
      components &&
      components[filter.componentId]?.clazz &&
      components[filter.componentId]?.toFilter
    ) {
      return components[filter.componentId].toFilter(filter.componentValue);
    } else {
      return '';
    }

    /*
  
      if (
        filter.component &&
        filter.component.toFilter &&
        filter.component.value
      ) {
        return filter.component.toFilter(filter.component.value);
      } else {
        return '';
      }
  
    */
  } else {
    //go through every child
    let returnValue = '(';
    filter.children.forEach((child, i) => {
      returnValue += `${getTreeQuery(child, components)}${filter.children && i < filter.children.length - 1
        ? ` ${filter?.operator === 'NOT'
          ? 'and not'
          : filter?.operator?.toLowerCase()
        } `
        : ''
        }`;
    });
    returnValue += ')';
    return returnValue;
  }
};


export interface IAlert {
  id: number;
  name: string;
  cdc_id: string;
  confirmation_date?: string;
  filter: string;
  enable_mail_notification: boolean;
}


export interface IUploadAlert extends Pick<IAlert, 'name' | 'cdc_id' | 'filter' | 'enable_mail_notification'> {}

export function isAlert(obj: IAlert | IUploadAlert): obj is IAlert {
  return typeof (obj as any)?.id === 'number';
}


// const test: IAlert | IUploadAlert = null;

// if (!isAlert(test)) {
// }