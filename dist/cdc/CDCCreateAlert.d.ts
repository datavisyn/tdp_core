/// <reference types="react" />
import { IAlert, IFilter, IFilterComponent, IUploadAlert } from './interface';
interface ICDCCreateAlert {
    alertData: IUploadAlert;
    setAlertData: (formData: IUploadAlert) => void;
    filterSelection: IFilter<any>[] | undefined;
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
    alertList: IAlert[];
    setAlertList: (alerts: IAlert[]) => void;
    setSelectedAlert: (alert: IAlert) => void;
    setCreationMode: (mode: boolean) => void;
    cdcs: string[];
}
export declare function CDCCreateAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, setCreationMode, setSelectedAlert, cdcs }: ICDCCreateAlert): JSX.Element;
export {};
