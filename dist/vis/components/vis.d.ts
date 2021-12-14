/// <reference types="react" />
import { CategoricalColumn, NumericalColumn } from '../types/generalTypes';
export interface VisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected: {
        [key: number]: boolean;
    };
    colors?: string[];
    shapes?: string[];
    selectionCallback: (s: number[]) => void;
    filterCallback: (s: string) => void;
}
export declare function Vis(props: VisProps): JSX.Element;