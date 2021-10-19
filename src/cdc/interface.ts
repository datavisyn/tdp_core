export interface IFilterComponent<V> {
    clazz: (props: {
      value: V;
      onValueChanged?: (value: V) => void;
    }) => JSX.Element;
    value?: V;
    toFilter?: (value: V) => string;
  }

  interface IData {
    num1: boolean;
    num2: boolean;
  }

  export interface IFilter<V = any> {
    id: string;
    name: string;
    disableRemoving?: boolean;
    disableDragging?: boolean;
    disableDropping?: boolean;
    operator?: 'AND' | 'OR' | 'NOT';
    component?: IFilterComponent<V>;
    children?: IFilter[];
  }

  export const itemTypes = {
    FILTERCARD: 'filtercard'
  };

  export const getFilterFromTree = (
    filter: IFilter,
    id: string
  ): { parent: IFilter | null; current: IFilter | null } => {
    if (filter?.id === id) {
      return { current: filter, parent: null };
    } else if (filter && filter.children) {
      // Is the id part of my children?
      const current = filter.children.find((f) => f.id === id);
      if (current) {
        return { parent: filter, current };
      }

      // Otherwise, continue with all children
      for (const f of filter.children) {
        const current = getFilterFromTree(f, id);
        if (current.current) {
          return current;
        }
      }
    }

    return { parent: null, current: null };
  };

export const getTreeQuery = (filter: IFilter) => {
  if (!filter) {
    return '';
  }
  if (!filter.children) {
  //leaf filter
    if (
      filter.component &&
      filter.component.toFilter &&
      filter.component.value
    ) {
      return filter.component.toFilter(filter.component.value);
    } else {
      return '';
    }
  } else {
    //go through every child
    let returnValue = '(';
    filter.children.forEach((child, i) => {
      returnValue += `${getTreeQuery(child)}${
        filter.children && i < filter.children.length - 1
          ? ` ${
              filter?.operator === 'NOT'
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
  confirmation_date: string;
}
