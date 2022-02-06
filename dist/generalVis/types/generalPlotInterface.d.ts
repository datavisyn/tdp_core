import { AllDropdownOptions, PlotlyInfo, GeneralHomeProps, ColumnInfo } from './generalTypes';
export interface GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[], updateSelectedCatCols: (s: ColumnInfo[]) => void, updateSelectedNumCols: (s: ColumnInfo[]) => void): any;
    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo;
}
