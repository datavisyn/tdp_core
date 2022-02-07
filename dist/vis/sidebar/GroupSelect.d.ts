/// <reference types="react" />
import { ColumnInfo, VisColumn } from '../interfaces';
interface GroupSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function GroupSelect(props: GroupSelectProps): JSX.Element;
export {};
//# sourceMappingURL=GroupSelect.d.ts.map