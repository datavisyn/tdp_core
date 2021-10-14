/// <reference types="react" />
import { IFilter } from "./interface";
export declare function FilterCard({ filter, onDrop, onDelete, onChange, onValueChanged }: {
    filter: IFilter;
    onDrop?: any;
    onDelete?: (filter: IFilter) => void;
    onChange?: (filter: IFilter, changeFunc: (filter: IFilter) => void) => void;
    onValueChanged?: (filter: IFilter, value: any) => void;
}): JSX.Element;
