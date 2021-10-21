/// <reference types="react" />
import { IFilter, IFilterComponent } from './interface';
export interface ICDCTextFilterValue {
    fields: {
        field: string;
        options: string[];
    }[];
    filter: {
        field: string;
        value: string[];
    }[];
}
export declare const CDCTextFilterId = "text";
export declare const CDCTextFilter: IFilterComponent<null>;
export declare function createCDCTextFilter(id: string, name: string, value: ICDCTextFilterValue): IFilter<ICDCTextFilterValue>;
export declare function CDCTextFilterComponent({ value, onValueChanged }: {
    value: any;
    onValueChanged: any;
}): JSX.Element;
