/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface ShapeSelectProps {
    callback: (shape: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function ShapeSelect({ callback, columns, currentSelected }: ShapeSelectProps): JSX.Element;
export {};
//# sourceMappingURL=ShapeSelect.d.ts.map