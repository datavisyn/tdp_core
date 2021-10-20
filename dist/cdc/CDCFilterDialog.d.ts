/// <reference types="react" />
export interface ICDCFormData {
    name: string;
    cdc_id: string;
    enable_mail_notification: boolean;
}
export declare function CDCFilterDialog(): JSX.Element;
export declare class CDCFilterDialogClass {
    private node;
    constructor(parent: HTMLElement);
    private init;
}
