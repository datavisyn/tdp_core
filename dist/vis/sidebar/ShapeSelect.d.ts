/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface ShapeSelectProps {
    callback: (shape: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function ShapeSelect(props: ShapeSelectProps): JSX.Element;
export {};
