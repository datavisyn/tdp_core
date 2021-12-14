import { ENumericalColorScaleType } from '../scatter/utils';
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../interfaces';
interface ColorSelectProps {
    callback: (c: ColumnInfo) => void;
    numTypeCallback?: (c: ENumericalColorScaleType) => void;
    currentNumType?: ENumericalColorScaleType;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function ColorSelect({ callback, numTypeCallback, currentNumType, columns, currentSelected, }: ColorSelectProps): JSX.Element;
export {};
