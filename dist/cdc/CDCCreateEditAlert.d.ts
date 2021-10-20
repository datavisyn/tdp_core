/// <reference types="react" />
import { ICDCFormData } from ".";
import { IAlert, IFilter } from "./interface";
interface ICDCCreateEditAlert {
    formData: ICDCFormData;
    setFormData: (formData: ICDCFormData) => void;
    selectedAlert?: IAlert;
    filterSelection: IFilter<any>[];
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
}
export declare function CDCCreateEditAlert({ formData, setFormData, filterSelection, selectedAlert, filter, setFilter }: ICDCCreateEditAlert): JSX.Element;
export {};
