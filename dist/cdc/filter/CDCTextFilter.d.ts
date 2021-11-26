/// <reference types="react" />
import { IFilter, IFilterComponent } from '../interfaces';
export declare const CDCTextFilterId = "text";
export declare const CDCTextFilter: IFilterComponent<null>;
export declare function createCDCTextFilter(id: string, field: string, value: string[]): IFilter<string[]>;
export declare function CDCTextFilterComponent({ value, onValueChanged, onFieldChanged, disabled, field, config }: {
    value: any;
    onValueChanged: any;
    onFieldChanged: any;
    disabled: any;
    field: any;
    config: any;
}): JSX.Element;
