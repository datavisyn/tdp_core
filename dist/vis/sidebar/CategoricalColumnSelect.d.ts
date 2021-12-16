/// <reference types="react" />
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo[];
}
export declare function CategoricalColumnSelect(props: CategoricalColumnSelectProps): JSX.Element;
export {};
