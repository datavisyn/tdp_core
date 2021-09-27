/// <reference types="react" />
import { ENumericalColorScaleType } from '../../plotUtils/scatter';
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../../types/generalTypes';
interface ColorSelectProps {
    callback: (c: ColumnInfo) => void;
    numTypeCallback: (c: ENumericalColorScaleType) => void;
    currentNumType: ENumericalColorScaleType;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}
export declare function ColorSelect(props: ColorSelectProps): JSX.Element;
export {};
