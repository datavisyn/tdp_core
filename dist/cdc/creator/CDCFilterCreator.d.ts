import React from 'react';
import { IFilter, IFilterComponent } from '../interfaces';
interface ICDCFilterCreatorProps {
    filterComponents?: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    filterSelection?: IFilter[];
    filter: IFilter;
    setFilter: React.Dispatch<React.SetStateAction<IFilter>>;
    disableFilter?: boolean;
    isInvalid?: boolean;
}
export declare function CDCFilterCreator({ filterSelection, filter, setFilter, disableFilter, isInvalid, filterComponents }: ICDCFilterCreatorProps): JSX.Element;
export {};
