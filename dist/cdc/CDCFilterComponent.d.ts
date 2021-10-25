import React from 'react';
import { IFilter, IFilterComponent } from './interface';
interface ICDCFilterComponentProps {
    filterSelection?: IFilter<any>[];
    filter: IFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
    disableFilter?: boolean;
}
export declare function CDCFilterComponent({ filterSelection, filter, setFilter, filterComponents, disableFilter }: ICDCFilterComponentProps): JSX.Element;
export {};
