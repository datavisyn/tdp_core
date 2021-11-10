/// <reference types="react" />
import { IFilter, IFilterComponent, IUploadAlert } from './interfaces';
interface ICDCCreateAlert {
    alertData: IUploadAlert;
    setAlertData: (formData: IUploadAlert) => void;
    filterSelection: IFilter<any>[] | undefined;
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
    filterComponents: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    onAlertChanged: (id?: number) => void;
    setCreationMode: (mode: boolean) => void;
    cdcs: string[];
    compareColumnOptions: string[];
}
export declare function CDCCreateAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, setCreationMode, cdcs, compareColumnOptions }: ICDCCreateAlert): JSX.Element;
export {};
