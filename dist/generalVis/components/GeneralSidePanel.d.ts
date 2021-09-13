/// <reference types="react" />
import { CategoricalColumn, GenericOption, NumericalColumn, supportedPlotlyVis } from '../types/generalTypes';
interface GeneralSidePanelProps {
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: supportedPlotlyVis) => void;
    currentVis: supportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn)[];
    dropdowns: GenericOption[];
    filterCallback: (s: string) => void;
}
export declare function GeneralSidePanel(props: GeneralSidePanelProps): JSX.Element;
export {};
