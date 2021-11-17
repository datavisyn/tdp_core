import { IFilter, IFilterComponent } from '../interfaces';
export interface ICDCRangeFilterValue {
    min: number;
    max: number;
}
export declare const CDCRangeFilterId = "range";
export declare const CDCRangeFilter: IFilterComponent<null>;
export declare function createCDCRangeFilter(id: string, field: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue>;
