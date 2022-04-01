import { ColumnInfo, VisColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo;
}
export declare function CategoricalColumnSingleSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=CategoricalColumnSingleSelect.d.ts.map