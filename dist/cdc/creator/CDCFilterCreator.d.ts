import React from 'react';
import { IFilter, IFilterComponent } from '../interfaces';
interface ICDCFilterCreatorProps {
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
export declare function CDCFilterCreator({ filterSelection, filter, setFilter, filterComponents, disableFilter, isInvalid }: ICDCFilterCreatorProps): JSX.Element;
export {};
