/// <reference types="react" />
import { IFilter } from './interface';
interface ICDCCheckboxFilterValue {
    fields: string[];
    filter: string[];
}
export declare function createCDCCheckboxFilter(id: string, name: string, value: ICDCCheckboxFilterValue): IFilter<ICDCCheckboxFilterValue>;
export declare function CDCCheckboxFilter({ value, onValueChanged }: {
    value: any;
    onValueChanged: any;
}): JSX.Element;
export {};
