/// <reference types="react" />
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
interface SingleColumnSelectProps {
    callback: (s: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo;
    label: string;
    type: EColumnTypes[];
}
export declare function SingleColumnSelect({ callback, columns, currentSelected, label, type }: SingleColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=SingleColumnSelect.d.ts.map