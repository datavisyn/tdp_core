/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}
export declare function NumericalColumnSelect(props: NumericalColumnSelectProps): JSX.Element;
export {};
//# sourceMappingURL=NumericalColumnSelect.d.ts.map