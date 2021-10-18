/// <reference types="react" />
import { IFilter } from './interface';
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
export declare function createCDCTextFilter(id: string, name: string, value: ICDCTextFilterValue): IFilter<ICDCTextFilterValue>;
export declare function CDCTextFilter({ value, onValueChanged }: {
    value: any;
    onValueChanged: any;
}): JSX.Element;
