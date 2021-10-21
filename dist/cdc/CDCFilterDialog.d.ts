/// <reference types="react" />
import { IFilter, IFilterComponent } from "./interface";
export interface ICDCFormData {
    name: string;
    cdc_id: string;
    enable_mail_notification: boolean;
}
export declare function CDCFilterDialog({ filterComponents, filtersByCDC }: {
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
    filtersByCDC: {
        [cdcId: string]: IFilter<any>[];
    };
}): JSX.Element;
export declare class CDCFilterDialogClass {
    private node;
    constructor(parent: HTMLElement);
    private init;
}
