import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../interfaces';
interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
}
export declare function NumericalColumnSelect(props: NumericalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=NumericalColumnSelect.d.ts.map