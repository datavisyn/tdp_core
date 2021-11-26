/// <reference types="react" />
import { IAlert } from '../interfaces';
interface ICDCDataChangeTable {
    selectedAlert: IAlert;
    onAlertChanged: (id?: number) => void;
}
export declare function CDCDataChangeTable({ selectedAlert, onAlertChanged }: ICDCDataChangeTable): JSX.Element;
export {};
