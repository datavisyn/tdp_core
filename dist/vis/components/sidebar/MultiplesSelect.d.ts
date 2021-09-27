/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../../types/generalTypes';
interface MultiplesSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function MultiplesSelect(props: MultiplesSelectProps): JSX.Element;
export {};
