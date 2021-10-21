/// <reference types="react" />
import { IFilter, IFilterComponent } from './interface';
export declare function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged, filterComponents }: {
    filter: IFilter;
    onDrop?: any;
    onDelete?: (filter: IFilter) => void;
    onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
    onValueChanged?: (filter: IFilter, value: any) => void;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
}): JSX.Element;
