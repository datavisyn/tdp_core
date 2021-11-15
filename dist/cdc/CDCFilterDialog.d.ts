/// <reference types="react" />
import { IAlert, IFilter, IUploadAlert, ICDCConfiguration } from './interfaces';
interface ICDCFilterDialogProps {
    cdcConfig: {
        [cdcId: string]: ICDCConfiguration;
    };
}
export declare const CDC_DEFAULT_ALERT_DATA: IUploadAlert;
export declare const CDC_DEFAULT_FILTER: {
    id: string;
    operator?: "AND" | "OR";
    type: string;
    value?: any;
    field?: string;
    children?: IFilter<any>[];
};
export declare const runAlert: (id: number) => Promise<IAlert>;
export declare function CDCFilterDialog({ cdcConfig }: ICDCFilterDialogProps): JSX.Element;
export declare class CDCFilterDialogClass {
    private node;
    constructor(parent: HTMLElement);
    private init;
}
export {};
