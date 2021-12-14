/// <reference types="react" />
import { IFilter, IFilterComponent, IFilterComponentProps } from '../interfaces';
export declare const CDCTextFilterId = "text";
export declare const CDCTextFilter: IFilterComponent<null>;
export declare function createCDCTextFilter(id: string, field: string, value: string[]): IFilter<string[]>;
export declare function CDCTextFilterComponent({ value, onValueChanged, disabled, field, config }: IFilterComponentProps<string[]>): JSX.Element;
