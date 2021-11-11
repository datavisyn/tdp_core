/// <reference types="react" />
import { IAlert, IFilter, IFilterComponent, IUploadAlert } from './interfaces';
interface ICDCFilterDialogProps {
    filterComponents: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    filtersByCDC: {
        [cdcId: string]: IFilter<any>[];
    };
    compareColumnOptions: string[];
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
export declare function CDCFilterDialog({ filterComponents, filtersByCDC, compareColumnOptions }: ICDCFilterDialogProps): JSX.Element;
export declare class CDCFilterDialogClass {
    private node;
    constructor(parent: HTMLElement);
    private init;
}
export {};
