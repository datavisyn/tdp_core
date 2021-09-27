/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../types/generalTypes';
interface NumericalColumnChooserProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
    disabled: boolean;
}
export declare function NumericalColumnChooser(props: NumericalColumnChooserProps): JSX.Element;
export {};
