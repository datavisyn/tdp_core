/// <reference types="react" />
import { IFilter, IFilterComponent } from '../interfaces';
interface IFilterCardProps {
    filter: IFilter;
    onDrop?: (item: IFilter, { target, index }: {
        target: IFilter;
        index: number;
    }) => void;
    onDelete?: (filter: IFilter) => void;
    onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
    onValueChanged?: (filter: IFilter, value: any, field: string) => void;
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
export declare function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged, filterComponents, disableFilter, isInvalid, disableDragging, disableRemoving }: IFilterCardProps): JSX.Element;
export {};
