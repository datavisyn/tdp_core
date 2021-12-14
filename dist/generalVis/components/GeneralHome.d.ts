/// <reference types="react" />
import { CategoricalColumn, NumericalColumn } from '../types/generalTypes';
export interface GeneralHomeProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    selected: {
        [key: number]: boolean;
    };
    selectionCallback: (s: number[]) => void;
    filterCallback: (s: string) => void;
}
export declare function GeneralHome(props: GeneralHomeProps): JSX.Element;
