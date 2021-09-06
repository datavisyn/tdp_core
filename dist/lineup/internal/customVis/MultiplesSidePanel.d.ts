/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
interface MultiplesSidePanelProps {
    chartTypeChangeCallback: (s: string) => void;
    updateSelectedNumCols: (s: string[]) => void;
    updateSelectedCatCols: (s: string[]) => void;
    selectedCatCols: string[];
    selectedNumCols: string[];
    setCurrentVis: (s: supportedPlotlyVis) => void;
    currentVis: supportedPlotlyVis;
    currentType: supportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn)[];
    dropdowns: GenericSelect[];
}
declare type GenericSelect = {
    name: string;
    currentSelected: string;
    options: string[];
    callback: (s: string) => void;
};
export declare function MultiplesSidePanel(props: MultiplesSidePanelProps): JSX.Element;
export {};
