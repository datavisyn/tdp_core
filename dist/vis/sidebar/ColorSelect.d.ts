/// <reference types="react" />
import { ColumnInfo, VisColumn, ENumericalColorScaleType } from '../interfaces';
interface ColorSelectProps {
    callback: (c: ColumnInfo) => void;
    numTypeCallback?: (c: ENumericalColorScaleType) => void;
    currentNumType?: ENumericalColorScaleType;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}
export declare function ColorSelect({ callback, numTypeCallback, currentNumType, columns, currentSelected }: ColorSelectProps): JSX.Element;
export {};
//# sourceMappingURL=ColorSelect.d.ts.map