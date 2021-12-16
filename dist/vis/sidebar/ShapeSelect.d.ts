/// <reference types="react" />
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface ShapeSelectProps {
    callback: (shape: ColumnInfo) => void;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function ShapeSelect(props: ShapeSelectProps): JSX.Element;
export {};
