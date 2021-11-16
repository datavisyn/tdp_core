/// <reference types="react" />
import { IFilter } from '../interfaces';
interface IDropZoneProps {
    onDrop: (item: IFilter, { target, index }: {
        target: IFilter;
        index: number;
    }) => void;
    canDrop: boolean;
    filter: IFilter;
    index: number;
}
export declare function DropZone({ canDrop, onDrop, filter, index }: IDropZoneProps): JSX.Element;
export {};
