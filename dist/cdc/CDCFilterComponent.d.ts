/// <reference types="react" />
import { IFilter } from "./interface";
interface ICDCFilterComponentProps {
    filterSelection: IFilter<any>[];
    filter: IFilter;
    setFilter: (filter: IFilter) => void;
}
export declare function CDCFilterComponent({ filterSelection, filter, setFilter }: ICDCFilterComponentProps): JSX.Element;
export {};
