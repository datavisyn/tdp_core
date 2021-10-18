import { IFilter } from './interface';
export interface ICDCRangeFilterValue {
    min: number;
    max: number;
}
export declare function createCDCRangeFilter(id: string, name: string, value: ICDCRangeFilterValue): IFilter<ICDCRangeFilterValue>;
