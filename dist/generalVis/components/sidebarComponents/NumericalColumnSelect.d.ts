/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../../types/generalTypes';
interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
}
export declare function NumericalColumnSelect(props: NumericalColumnSelectProps): JSX.Element;
export {};
