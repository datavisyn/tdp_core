/// <reference types="react" />
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface GroupSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function GroupSelect(props: GroupSelectProps): JSX.Element;
export {};
