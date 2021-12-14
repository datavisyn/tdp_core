/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../types/generalTypes';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
    disabled: boolean;
}
export declare function CategoricalColumnSelect(props: CategoricalColumnSelectProps): JSX.Element;
export {};
