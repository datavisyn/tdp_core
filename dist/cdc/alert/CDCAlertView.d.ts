/// <reference types="react" />
import { IAlert, IFilter, IUploadAlert, ICDCConfiguration } from '../interfaces';
interface ICDCEditAlert {
    alertData: IUploadAlert;
    setAlertData: (formData: IUploadAlert) => void;
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
    onAlertChanged: (id?: number) => void;
    selectedAlert?: IAlert;
    creationMode: boolean;
    setCreationMode: (mode: boolean) => void;
    cdcConfig: {
        [cdcId: string]: ICDCConfiguration;
    };
}
export declare function CDCAlertView({ alertData, setAlertData, filter, setFilter, onAlertChanged, selectedAlert, setCreationMode, creationMode, cdcConfig }: ICDCEditAlert): JSX.Element;
export {};
