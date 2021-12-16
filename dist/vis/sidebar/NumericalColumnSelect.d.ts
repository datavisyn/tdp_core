/// <reference types="react" />
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo[];
}
export declare function NumericalColumnSelect(props: NumericalColumnSelectProps): JSX.Element;
export {};
