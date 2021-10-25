/// <reference types="react" />
import { IFilter, IFilterComponent } from './interface';
interface ICDCCheckboxFilterValue {
    fields: string[];
    filter: string[];
}
export declare const CDCCheckboxFilterId = "checkbox";
export declare const CDCCheckboxFilter: IFilterComponent<null>;
export declare function createCDCCheckboxFilter(id: string, name: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue>;
export declare function CDCCheckboxFilterComponent({ value, onValueChanged, disabled }: {
    value: any;
    onValueChanged: any;
    disabled: any;
}): JSX.Element;
export {};
