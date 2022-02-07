/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface MultiplesSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function MultiplesSelect(props: MultiplesSelectProps): JSX.Element;
export {};
//# sourceMappingURL=MultiplesSelect.d.ts.map