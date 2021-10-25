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
    confirmation_date?: string;
    filter_dump: string;
    filter_query: string;
    enable_mail_notification: boolean;
}
export interface IUploadAlert extends Pick<IAlert, 'name' | 'cdc_id' | 'filter_dump' | 'filter_query' | 'enable_mail_notification'> {
}
export declare function isAlert(obj: IAlert | IUploadAlert): obj is IAlert;
