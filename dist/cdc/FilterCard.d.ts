/// <reference types="react" />
import { IFilter, IFilterComponent } from './interfaces';
interface IFilterCardProps {
    filter: IFilter;
    onDrop?: any;
    onDelete?: (filter: IFilter) => void;
    onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
    onValueChanged?: (filter: IFilter, value: any) => void;
    onFieldChanged?: (filter: IFilter, field: any) => void;
    filterComponents: {
        [key: string]: {
            component: IFilterComponent<any>;
            config?: any;
        };
    };
    disableFilter: boolean;
    isInvalid?: boolean;
    disableRemoving?: boolean;
    disableDragging?: boolean;
}
export declare function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged, onFieldChanged, filterComponents, disableFilter, isInvalid, disableDragging, disableRemoving }: IFilterCardProps): JSX.Element;
export {};
