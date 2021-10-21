import React from "react";
import { IFilter, IFilterComponent } from "./interface";
interface ICDCFilterComponentProps {
    filterSelection?: IFilter<any>[];
    filter: IFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
}
export declare function CDCFilterComponent({ filterSelection, filter, setFilter, filterComponents }: ICDCFilterComponentProps): JSX.Element;
export {};
