/// <reference types="react" />
import { IFilter, IFilterComponent } from './interface';
interface IFilterCardProps {
    filter: IFilter;
    onDrop?: any;
    onDelete?: (filter: IFilter) => void;
    onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
    onValueChanged?: (filter: IFilter, value: any) => void;
    filterComponents: {
        [key: string]: IFilterComponent<any>;
    };
    disableFilter: boolean;
}
export declare function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged, filterComponents, disableFilter }: IFilterCardProps): JSX.Element;
export {};
