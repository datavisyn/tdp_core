/// <reference types="react" />
import { IFilter } from './interface';
interface IDropZoneProps {
    onDrop: any;
    canDrop: boolean;
    filter: IFilter;
    index: number;
}
export declare function DropZone({ canDrop, onDrop, filter, index }: IDropZoneProps): JSX.Element;
export {};
