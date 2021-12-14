/// <reference types="react" />
import { CategoricalColumn, GenericSelect, NumericalColumn, supportedPlotlyVis } from './GeneralHome';
interface MultiplesSidePanelProps {
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: supportedPlotlyVis) => void;
    currentVis: supportedPlotlyVis;
    currentType: supportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn)[];
    dropdowns: GenericSelect[];
    filterCallback: (s: string) => void;
}
export declare function MultiplesSidePanel(props: MultiplesSidePanelProps): JSX.Element;
export {};
