import { AllDropdownOptions, ColumnInfo } from '../types/generalTypes';
import { GeneralPlot } from '../types/generalPlotInterface';
import { PlotlyInfo, GeneralHomeProps } from '../types/generalTypes';
export declare class PlotlyStrip implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[], updateSelectedCatCols: (s: ColumnInfo[]) => void, updateSelectedNumCols: (s: ColumnInfo[]) => void): void;
    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo;
}
