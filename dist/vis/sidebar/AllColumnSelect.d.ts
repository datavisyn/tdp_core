/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface AllColumnSelectProps {
    callback: (allCols: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}
export declare function AllColumnSelect({ callback, columns, currentSelected }: AllColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=AllColumnSelect.d.ts.map