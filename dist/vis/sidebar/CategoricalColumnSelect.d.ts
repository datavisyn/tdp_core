/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}
export declare function CategoricalColumnSelect(props: CategoricalColumnSelectProps): JSX.Element;
export {};
