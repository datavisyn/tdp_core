/// <reference types="react" />
import { IFilter, IFilterComponent } from '../interfaces';
export declare function CDCFilterCreator({ filterSelection, filter, setFilter, disableFilter, isInvalid, filterComponents }: {
    filterComponents?: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    filterSelection?: IFilter[];
    filter: IFilter;
    setFilter: (value: IFilter) => void;
    disableFilter?: boolean;
    isInvalid?: boolean;
}): JSX.Element;
