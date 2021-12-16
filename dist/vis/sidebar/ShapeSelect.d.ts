/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../interfaces';
interface ShapeSelectProps {
    callback: (shape: ColumnInfo) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function ShapeSelect(props: ShapeSelectProps): JSX.Element;
export {};
