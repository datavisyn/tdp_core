import { IFilter, IFilterComponent } from './interface';
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
export declare function createCDCRangeFilter(id: string, name: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue>;
