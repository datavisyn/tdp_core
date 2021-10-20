/// <reference types="react" />
import { IFilter } from "./interface";
interface ICDCCreateAlert {
    filter: IFilter<any>;
    setFilter: (filter: IFilter<any>) => void;
    filterSelection: IFilter<any>[];
}
export declare function CDCCreateAlert({ filter, setFilter, filterSelection }: ICDCCreateAlert): JSX.Element;
export {};
