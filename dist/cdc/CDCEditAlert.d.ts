/// <reference types="react" />
import { IAlert, IFilter, IFilterComponent, IUploadAlert } from "./interface";
interface ICDCEditAlert {
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
    selectedAlert: IAlert;
    setSelctedAlert: (alert: IAlert) => void;
    cdcs: string[];
}
export declare function CDCEditAlert({ alertData, setAlertData, filterSelection, filter, setFilter, filterComponents, alertList, setAlertList, selectedAlert, setSelctedAlert, cdcs }: ICDCEditAlert): JSX.Element;
export {};
