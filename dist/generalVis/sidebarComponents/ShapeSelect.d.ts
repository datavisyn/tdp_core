/// <reference types="react" />
import { CategoricalColumn, ESupportedPlotlyVis, NumericalColumn } from '../types/generalTypes';
interface ShapeSelectProps {
    callback: (s: ESupportedPlotlyVis) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: NumericalColumn | CategoricalColumn;
    disabled: boolean;
}
export declare function ShapeSelect(props: ShapeSelectProps): JSX.Element;
export {};
