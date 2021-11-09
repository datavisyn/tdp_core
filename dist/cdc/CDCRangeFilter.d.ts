import { IFilter, IFilterComponent } from './interfaces';
export interface ICDCRangeFilterValue {
    config: {
        minValue: number;
        maxValue: number;
        label: string;
        field: string;
    };
    value: {
        min: number;
        max: number;
    };
}
export declare const CDCRangeFilterId = "range";
export declare const CDCRangeFilter: IFilterComponent<null>;
export declare function createCDCRangeFilter(id: string, field: string, value: {
    min: number;
    max: number;
}): IFilter<ICDCRangeFilterValue>;
