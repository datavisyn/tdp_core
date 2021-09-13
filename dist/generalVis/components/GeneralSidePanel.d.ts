/// <reference types="react" />
import { CategoricalColumn, ESupportedPlotlyVis, GenericOption, NumericalColumn } from '../types/generalTypes';
interface GeneralSidePanelProps {
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: ESupportedPlotlyVis) => void;
    currentVis: ESupportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn)[];
    dropdowns: GenericOption[];
    filterCallback: (s: string) => void;
}
export declare function GeneralSidePanel(props: GeneralSidePanelProps): JSX.Element;
export {};
