/// <reference types="react" />
import { IUploadAlert, ICDCConfiguration } from './interfaces';
interface ICDCFilterDialogProps {
    cdcConfig: {
        [cdcId: string]: ICDCConfiguration;
    };
}
export declare const CDC_DEFAULT_ALERT_DATA: () => IUploadAlert;
export declare function CDCFilterDialog({ cdcConfig }: ICDCFilterDialogProps): JSX.Element;
export declare class CDCFilterDialogClass {
    private node;
    constructor(parent: HTMLElement);
    private init;
}
export {};
