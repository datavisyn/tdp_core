import React from 'react';
import { IFilter, IFilterComponent } from './interfaces';
interface ICDCFilterComponentProps {
    filterSelection?: IFilter<any>[];
    filter: IFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
    filterComponents: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    disableFilter?: boolean;
    isInvalid?: boolean;
}
export declare function CDCFilterComponent({ filterSelection, filter, setFilter, filterComponents, disableFilter, isInvalid }: ICDCFilterComponentProps): JSX.Element;
export {};
