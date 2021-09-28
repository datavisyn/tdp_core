/// <reference types="react" />
import { CategoricalColumn, NumericalColumn } from './interfaces';
export interface VisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected?: {
        [key: number]: boolean;
    };
    colors?: string[];
    shapes?: string[];
    selectionCallback?: (s: number[]) => void;
    filterCallback?: (s: string) => void;
}
export declare function Vis({ columns, selected, colors, shapes, selectionCallback, filterCallback }: VisProps): JSX.Element;
