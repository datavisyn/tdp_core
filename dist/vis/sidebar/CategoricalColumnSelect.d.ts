import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../interfaces';
interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
}
export declare function CategoricalColumnSelect(props: CategoricalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=CategoricalColumnSelect.d.ts.map