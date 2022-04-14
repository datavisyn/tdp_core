/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo;
    label?: string;
}
export declare function CategoricalColumnSingleSelect({ callback, columns, currentSelected, label }: CategoricalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=CategoricalColumnSingleSelect.d.ts.map