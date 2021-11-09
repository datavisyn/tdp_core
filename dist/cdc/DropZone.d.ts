/// <reference types="react" />
import { IFilter } from './interfaces';
interface IDropZoneProps {
    onDrop: any;
    canDrop: boolean;
    filter: IFilter;
    index: number;
}
export declare function DropZone({ canDrop, onDrop, filter, index }: IDropZoneProps): JSX.Element;
export {};
