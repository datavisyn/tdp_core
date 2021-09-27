/// <reference types="react" />
import { CategoricalColumn, ESupportedPlotlyVis, NumericalColumn } from '../types/generalTypes';
interface ColorSelectProps {
    callback: (s: ESupportedPlotlyVis) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: NumericalColumn | CategoricalColumn;
    disabled: boolean;
}
export declare function ColorSelect(props: ColorSelectProps): JSX.Element;
export {};
