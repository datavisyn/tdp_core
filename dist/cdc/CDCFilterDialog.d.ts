/// <reference types="react" />
import { IAlert, IFilter, IFilterComponent, IUploadAlert } from './interface';
interface ICDCFilterDialogProps {
    filterComponents: {
        [key: string]: IFilterComponent<any>;
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
    disableDragging: boolean;
    disableRemoving: boolean;
    id: string;
    name: string;
    disableDropping?: boolean;
    operator?: "AND" | "OR" | "NOT";
    componentId: string;
    componentValue: null;
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
