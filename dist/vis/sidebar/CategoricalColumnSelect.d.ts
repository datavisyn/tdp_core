/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}
export declare function CategoricalColumnSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=CategoricalColumnSelect.d.ts.map