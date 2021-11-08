/// <reference types="react" />
import { IFilter, IFilterComponent, IUploadAlert } from './interface';
interface ICDCCreateAlert {
    alertData: IUploadAlert;
    setAlertData: (formData: IUploadAlert) => void;
    filterSelection: IFilter<any>[] | undefined;
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
    onAlertChanged: (id?: number) => void;
    setCreationMode: (mode: boolean) => void;
    cdcs: string[];
    compareColumnOptions: {
        label: string;
        value: string;
    }[];
}
export declare function CDCCreateAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, setCreationMode, cdcs, compareColumnOptions }: ICDCCreateAlert): JSX.Element;
export {};
