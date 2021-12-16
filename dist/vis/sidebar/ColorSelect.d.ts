/// <reference types="react" />
import { ENumericalColorScaleType } from '../scatter/utils';
import { VisCategoricalColumn, ColumnInfo, VisNumericalColumn } from '../interfaces';
interface ColorSelectProps {
    callback: (c: ColumnInfo) => void;
    numTypeCallback?: (c: ENumericalColorScaleType) => void;
    currentNumType?: ENumericalColorScaleType;
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function ColorSelect({ callback, numTypeCallback, currentNumType, columns, currentSelected, }: ColorSelectProps): JSX.Element;
export {};
