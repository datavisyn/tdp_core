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
    compareColumnOptions: {
        label: string;
        value: string;
    }[];
}
export declare const DEFAULTALERTDATA: IUploadAlert;
export declare const DEFAULTFILTER: {
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
