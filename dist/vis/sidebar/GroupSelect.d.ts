import { ColumnInfo, VisColumn } from '../interfaces';
interface GroupSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function GroupSelect({ callback, columns, currentSelected }: GroupSelectProps): JSX.Element;
export {};
//# sourceMappingURL=GroupSelect.d.ts.map