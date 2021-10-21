/// <reference types="react" />
import { ICDCFormData } from ".";
import { IAlert, IFilter, IFilterComponent } from "./interface";
interface ICDCCreateEditAlert {
    formData: ICDCFormData;
    setFormData: (formData: ICDCFormData) => void;
    selectedAlert?: IAlert;
    filterSelection: IFilter<any>[] | undefined;
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
    editMode?: boolean;
    setEditMode?: (editMode: boolean) => void;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
}
export declare function CDCCreateEditAlert({ formData, setFormData, filterSelection, selectedAlert, filter, setFilter, editMode, setEditMode, filterComponents }: ICDCCreateEditAlert): JSX.Element;
export {};
