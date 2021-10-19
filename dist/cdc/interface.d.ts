/// <reference types="react" />
export interface IFilterComponent<V> {
    clazz: (props: {
        value: V;
        onValueChanged?: (value: V) => void;
    }) => JSX.Element;
    value?: V;
    toFilter?: (value: V) => string;
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
export declare const itemTypes: {
    FILTERCARD: string;
};
export declare const getFilterFromTree: (filter: IFilter, id: string) => {
    parent: IFilter | null;
    current: IFilter | null;
};
export declare const getTreeQuery: (filter: IFilter) => string;
export interface IAlert {
    id: number;
    name: string;
    cdc_id: string;
    confirmation_date: string;
}
