/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../../types/generalTypes';
interface GroupSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function GroupSelect(props: GroupSelectProps): JSX.Element;
export {};
