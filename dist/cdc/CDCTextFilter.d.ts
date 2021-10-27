/// <reference types="react" />
import { IFilter, IFilterComponent } from './interface';
export interface ICDCTextFilterValue {
    fields: {
        field: {
            label: string;
            value: string;
        };
        options: {
            label: string;
            value: string;
        }[];
    }[];
    filter: {
        field: {
            label: string;
            value: string;
        };
        value: {
            label: string;
            value: string;
        }[];
    }[];
}
export declare const CDCTextFilterId = "text";
export declare const CDCTextFilter: IFilterComponent<null>;
export declare function createCDCTextFilter(id: string, name: string, value: ICDCTextFilterValue): IFilter<ICDCTextFilterValue>;
export declare function CDCTextFilterComponent({ value, onValueChanged, disabled }: {
    value: any;
    onValueChanged: any;
    disabled: any;
}): JSX.Element;
