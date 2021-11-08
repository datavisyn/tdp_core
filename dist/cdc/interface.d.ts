/// <reference types="react" />
export interface IFilterComponent<V> {
    clazz: (props: {
        value: V;
        onValueChanged?: (value: V) => void;
        disabled: boolean;
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
export declare const itemTypes: {
    FILTERCARD: string;
};
export declare const getFilterFromTree: (filter: IFilter, id: string) => {
    parent: IFilter | null;
    current: IFilter | null;
};
export declare const getTreeQuery: (filter: IFilter, components: {
    [key: string]: IFilterComponent<any>;
}) => string;
export interface IAlert {
    id: number;
    name: string;
    cdc_id: string;
    filter: IFilter;
    filter_query: string;
    enable_mail_notification: boolean;
    latest_diff: {
        dictionary_item_added?: string[];
        dictionary_item_removed?: string[];
        values_changed?: {
            id: string;
            field: [];
            old_value: string;
            new_value: string;
        }[];
    };
    latest_fetched_data: any;
    latest_compare_date: Date;
    modification_date: string;
    confirmed_data: any;
    confirmation_date: Date;
    compare_columns: {
        label: string;
        value: string;
    }[];
}
export interface IUploadAlert extends Pick<IAlert, 'name' | 'cdc_id' | 'filter' | 'filter_query' | 'enable_mail_notification' | 'compare_columns'> {
}
export declare function isAlert(obj: IAlert | IUploadAlert): obj is IAlert;
