/// <reference types="react" />
import { CategoricalColumn, ColumnInfo, ESupportedPlotlyVis, GenericOption, NumericalColumn } from '../types/generalTypes';
interface GeneralSidePanelProps {
    updateSelectedNumCols: (s: ColumnInfo[]) => void;
    updateSelectedCatCols: (s: ColumnInfo[]) => void;
    selectedCatCols: ColumnInfo[];
    selectedNumCols: ColumnInfo[];
    setCurrentVis: (s: ESupportedPlotlyVis) => void;
    currentVis: ESupportedPlotlyVis;
    columns: (NumericalColumn | CategoricalColumn)[];
    dropdowns: GenericOption[];
    filterCallback: (s: string) => void;
}
export declare function GeneralSidePanel(props: GeneralSidePanelProps): JSX.Element;
export {};
