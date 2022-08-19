/// <reference types="react" />
import { ColumnInfo, EBarDisplayType, EBarGroupingType, VisColumn } from '../interfaces';
interface GroupSelectProps {
    groupColumnSelectCallback: (c: ColumnInfo) => void;
    groupTypeSelectCallback: (c: EBarGroupingType) => void;
    groupDisplaySelectCallback: (c: EBarDisplayType) => void;
    groupType: EBarGroupingType;
    displayType: EBarDisplayType;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function GroupSelect({ groupColumnSelectCallback, groupTypeSelectCallback, groupDisplaySelectCallback, groupType, displayType, columns, currentSelected, }: GroupSelectProps): JSX.Element;
export {};
//# sourceMappingURL=GroupSelect.d.ts.map