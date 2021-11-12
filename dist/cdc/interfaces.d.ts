/// <reference types="react" />
import { ISecureItem } from "phovea_core";
export interface IFilterComponent<V> {
    clazz: (props: {
        value: V;
        onValueChanged?: (value: V) => void;
        onFieldChanged?: (field: string) => void;
        disabled: boolean;
        config: any;
        field?: any;
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
export declare const itemTypes: {
    FILTERCARD: string;
};
export declare const getFilterFromTree: (filter: IFilter, id: string) => {
    parent: IFilter | null;
    current: IFilter | null;
};
export interface IAlert extends ISecureItem {
    id: number;
    name: string;
    cdc_id: string;
    filter: IFilter;
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
    latest_fetched_data: {
        _cdc_compare_id: string;
        [key: string]: any;
    }[];
    latest_compare_date?: Date;
    modification_date?: string;
    confirmed_data?: {
        _cdc_compare_id: string;
        [key: string]: any;
    }[];
    confirmation_date: Date;
    compare_columns: string[];
    latest_error?: string;
    latest_error_date?: Date;
}
export interface IUploadAlert extends Pick<IAlert, 'name' | 'cdc_id' | 'filter' | 'enable_mail_notification' | 'compare_columns'> {
    compare?: string[];
}
export declare function isAlert(obj: IAlert | IUploadAlert): obj is IAlert;
export interface IReactSelectOption {
    value: string;
    label: string;
}
