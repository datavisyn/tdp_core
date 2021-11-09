/// <reference types="react" />
import { IAlert, IFilter, IFilterComponent, IUploadAlert } from './interfaces';
interface ICDCEditAlert {
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
    selectedAlert: IAlert;
    cdcs: string[];
    compareColumnOptions: {
        label: string;
        value: string;
    }[];
}
export declare function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, onAlertChanged, selectedAlert, cdcs, compareColumnOptions }: ICDCEditAlert): JSX.Element;
export {};
