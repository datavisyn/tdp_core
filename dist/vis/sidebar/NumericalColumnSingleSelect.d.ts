/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo;
}
export declare function CategoricalColumnSingleSelect({ callback, columns, currentSelected }: NumericalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=NumericalColumnSingleSelect.d.ts.map