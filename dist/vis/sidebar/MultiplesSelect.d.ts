/// <reference types="react" />
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface MultiplesSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function MultiplesSelect(props: MultiplesSelectProps): JSX.Element;
export {};
