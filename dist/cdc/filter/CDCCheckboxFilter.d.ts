/// <reference types="react" />
import { IFilter, IFilterComponent } from '../interfaces';
interface ICDCCheckboxFilterValue {
    [field: string]: boolean;
}
export declare const CDCCheckboxFilterId = "checkbox";
export declare const CDCCheckboxFilter: IFilterComponent<null>;
export declare function createCDCCheckboxFilter(id: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue>;
export declare function CDCCheckboxFilterComponent({ value, onValueChanged, disabled, config }: {
    value: any;
    onValueChanged: any;
    disabled: any;
    config: any;
}): JSX.Element;
export {};
